import mongoose from "mongoose";
import pdf from "pdf-parse";
import Applicant from "../models/Applicant.model";
import Screening from "../models/Screening.model";

let extractionQueue = Promise.resolve();
const queueExtraction = <T>(task: () => Promise<T>): Promise<T> => {
  const result = extractionQueue.then(task);
  extractionQueue = result.catch(() => {}) as unknown as Promise<void>;
  return result;
};

interface PreparedIngestionData {
  text: string;
  ownerId: string;
  source: string;
  email?: string;
  resumeUrl?: string;
}

class ApplicantsService {
  /**
   * Candidate Registry Retrieval:
   * Optimized with Batch Loading.
   */
  async getAllApplicants(ownerId?: string) {
    if (!ownerId) return [];

    const applicants = await Applicant.find({ ownerId })
      .sort({ createdAt: -1 })
      .lean();

    const candidateIds = applicants.map(a => a._id.toString());
    
    // Efficiently batch load screenings to prevent N+1 queries
    const allScreenings = await Screening.find({
      candidateId: { $in: candidateIds }
    }).lean();

    const results = applicants.map((app: any) => {
      const candidateScreenings = allScreenings.filter(s => s.candidateId === app._id.toString());
      
      // Sort screenings by date to find the most recent evaluation
      const latestScreening = candidateScreenings.length > 0
        ? candidateScreenings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;

      return {
        ...app,
        isScreened: !!latestScreening,
        screening: latestScreening || null,
      };
    });

    return results;
  }

  /**
   * Profile Detail Retrieval:
   */
  async getApplicantById(id: string) {
    return await Applicant.findById(id);
  }

  /**
   * Candidate Profile Initialization:
   */
  async addApplicant(applicantData: any, ownerId: string) {
    const newApp = new Applicant({
      ...applicantData,
      ownerId: ownerId || "global",
    });
    return await newApp.save();
  }

  async ingestFromFilesWithOwner(
    files: Express.Multer.File[],
    ownerId: string,
    providedEmails?: string | string[],
  ) {
    const emails = Array.isArray(providedEmails) ? providedEmails : [providedEmails].filter(Boolean);
    
    console.log(`[INGESTION] Multi-file request: ${files.length} dossiers received.`);

    // --- PHASE 1: SEQUENTIAL EXTRACTION & PERSISTENCE ---
    const preparedData: PreparedIngestionData[] = [];
    for (let i = 0; i < files.length; i++) {
        try {
            const dataResults = await this.prepareFileData(files[i], ownerId, emails[i]);
            if (dataResults && Array.isArray(dataResults)) {
              preparedData.push(...dataResults);
            } else if (dataResults) {
              preparedData.push(dataResults);
            }
        } catch (err) {
            console.error(`[INGESTION ERROR] Phase 1 failed for ${files[i].originalname}:`, err);
        }
    }

    if (preparedData.length === 0) return [];

    // --- PHASE 2: PARALLEL AI ENRICHMENT ---
    console.log(`[INGESTION] Phase 1 complete. Proceeding with Phase 2 for ${preparedData.length} records.`);
    
    const results = await Promise.all(
        preparedData.map(async (data) => {
            try {
                return await this.processTextViaAI(data.text, data.ownerId, data.source, data.email, data.resumeUrl);
            } catch (err) {
                console.error(`[INGESTION ERROR] Phase 2 AI failure for ${data.source}:`, err);
                return null;
            }
        })
    );

    const successfulResults = results.filter(Boolean);
    console.log(`[INGESTION SUCCESS] Ingested ${successfulResults.length} of ${files.length} requested files.`);
    
    return successfulResults;
  }

  async ingestFromUrls(urls: string[], ownerId: string) {
    const axios = (await import("axios")).default;
    const preparedData: PreparedIngestionData[] = [];

    // --- PHASE 1: SEQUENTIAL URL FETCH & EXTRACTION ---
    for (const url of urls) {
      try {
        let targetUrl = url;
        let fileName = "external_doc";

        const docMatch = url.match(/\/d\/([\w_-]+)/);
        const docId = docMatch ? docMatch[1] : null;

        if (url.includes("docs.google.com/document") && docId) {
          targetUrl = `https://docs.google.com/document/d/${docId}/export?format=pdf`;
          fileName = `Doc-${docId}.pdf`;
        } else if (url.includes("docs.google.com/spreadsheets") && docId) {
          targetUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`;
          fileName = `Sheet-${docId}.csv`;
        } else if (url.includes("drive.google.com/file") && docId) {
          targetUrl = `https://docs.google.com/uc?id=${docId}&export=download`;
          fileName = `Drive-${docId}.pdf`;
        } else {
          fileName = url.split("/").pop()?.split(/[?#]/)[0] || "external_doc";
          const allowedExts = ["pdf", "docx", "doc", "csv", "xlsx", "txt"];
          const urlExt = fileName.split(".").pop()?.toLowerCase();
          
          if (!urlExt || !allowedExts.includes(urlExt)) {
            console.warn(`[SECURITY] URL Refusal: Insecure extension '${urlExt}' for ${url}`);
            continue;
          }
        }

        const response = await axios.get(targetUrl, { 
          responseType: "arraybuffer", 
          maxRedirects: 5,
          timeout: 20000,
          maxContentLength: 15 * 1024 * 1024,
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          }
        });

        const contentType = (response.headers["content-type"] || "").toLowerCase();
        const allowedMimeTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain"
        ];

        // Security Lockdown: Refuse HTML or executable content from URLs
        const isSafeMime = allowedMimeTypes.some(m => contentType.includes(m));
        const isGoogleProxy = url.includes("google.com"); 

        if (!isSafeMime && !isGoogleProxy) {
          console.error(`[SECURITY] URL Refusal: Untrusted content-type '${contentType}' for ${url}`);
          continue;
        }

        const file = {
          buffer: Buffer.from(response.data),
          originalname: fileName,
          mimetype: contentType,
        } as Express.Multer.File;

        if (contentType.includes("text/html") && !isGoogleProxy) {
          console.warn(`[SECURITY] Blocking HTML ingestion from unverified source: ${url}`);
          continue;
        }


        const res = await this.prepareFileData(file, ownerId);
        if (res) {
          if (Array.isArray(res)) {
            preparedData.push(...res);
          } else {
            preparedData.push(res);
          }
        }
      } catch (error: any) {
        console.error(`[URL INGESTION FAULT] ${url}:`, error.message);
      }
    }

    // --- PHASE 2: PARALLEL AI ENRICHMENT ---
    const results = await Promise.all(
        preparedData.map(async (data) => {
            try {
                return await this.processTextViaAI(data.text, data.ownerId, data.source, data.email, data.resumeUrl);
            } catch (err) {
                return null;
            }
        })
    );

    return results.filter(Boolean);
  }

  private async prepareFileData(file: Express.Multer.File, ownerId: string, email?: string) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const crypto = await import("crypto");
    
    const originalName = file.originalname || "";
    const mime = (file.mimetype || "").toLowerCase();
    let ext = originalName.includes(".") ? originalName.split(".").pop()?.toLowerCase() : "";
    
    const allowedExts = ["pdf", "docx", "doc", "csv", "xlsx", "txt"];
    
    // Explicitly force .pdf extension for PDF mime types or generic streams
    if (mime.includes("pdf") || ext === "0" || !ext) {
      ext = "pdf";
    }

    if (!allowedExts.includes(ext || "")) {
      console.warn(`[SECURITY] File Ingestion Refusal: Illegal extension Type '${ext}'`);
      return null;
    }

    // Create unique storage path
    const uploadDir = path.join(process.cwd(), "uploads", "resumes");
    try { await fs.mkdir(uploadDir, { recursive: true }); } catch(e) {}

    const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    const fileName = `CV-${uniqueId}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Deep clone buffer to eliminate shared memory risks in pdf-parse
    const bufferClone = Buffer.from(file.buffer);
    await fs.writeFile(filePath, bufferClone);

    let text = "";
    try {
      if (ext === "pdf" || mime.includes("pdf")) {
        const data = await pdf(bufferClone);
        text = data.text;
      } else if (ext === "docx" || ext === "doc" || mime.includes("word") || mime.includes("officedocument")) {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer: bufferClone });
        text = result.value;
      } else if (ext === "csv" || mime.includes("csv")) {
        // Handle CSV with potentially multiple profiles
        const results: any[] = [];
        const stream = require("stream");
        const csv = require("csv-parser");
        
        const bufferStream = new stream.PassThrough();
        bufferStream.end(bufferClone);
        
        const rows: any[] = [];
        await new Promise((resolve, reject) => {
          bufferStream
            .pipe(csv())
            .on("data", (data: any) => rows.push(data))
            .on("end", resolve)
            .on("error", reject);
        });

        if (rows.length > 0) {
          return rows.map((row, index) => {
            // Combine all row values into a descriptive text for AI extraction
            const rowText = Object.entries(row)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n");
            
            return {
              text: rowText,
              ownerId,
              source: `${file.originalname} (Row ${index + 1})`,
              email: row.email || row.Email || email,
              resumeUrl: undefined
            };
          });
        }
      }

      if (!text || text.trim().length < 50) {
          console.warn(`[INGESTION REFUSAL] ${file.originalname}: Insufficient text extracted.`);
          return null;
      }

      return [{
        text,
        ownerId,
        source: file.originalname,
        email,
        resumeUrl: (ext === "pdf") ? `resumes/${fileName}` : undefined
      }];
    } catch (error: any) {
      console.error(`[EXTRACTION ERROR] ${file.originalname}:`, error.message);
      return null;
    }
  }

  private async processTextViaAI(rawText: string, ownerId: string, source: string, fallbackEmail?: string, resumeUrl?: string) {
    const geminiService = (await import("./gemini.service")).default;
    const pdfService = (await import("./pdf.service")).default;
    const crypto = await import("crypto");
    
    const prompt = `
      Perform a deep extraction of candidate metadata from the following document.
      SESSION_ID: ${crypto.randomUUID()}
      SOURCE_REF: ${source}
      DOCUMENT_CONTENT: ${rawText.substring(0, 10000)}
      
      RESPOND ONLY WITH VALID JSON matching this exact structure:
      {
        "firstName": "string",
        "lastName": "string",
        "email": "string (Search links/icons carefully, return 'No email available' if not found)",
        "gender": "M | F | Not stated",
        "headline": "Short professional summary",
        "bio": "Brief professional biography",
        "location": "City, Country",
        "skills": [{"name": "string", "level": "Beginner | Intermediate | Advanced | Expert", "yearsOfExperience": number}],
        "languages": [{"name": "string", "proficiency": "Basic | Conversational | Fluent | Native"}],
        "workExperience": [{"company": "string", "role": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM | Present", "description": "string", "technologies": ["string"], "isCurrent": boolean}],
        "education": [{"institution": "string", "degree": "string", "fieldOfStudy": "string", "startYear": number, "endYear": number}],
        "certifications": [{"name": "string", "issuer": "string", "issueDate": "YYYY-MM"}],
        "projects": [{"name": "string", "description": "string", "technologies": ["string"], "role": "string", "link": "string", "startDate": "YYYY-MM", "endDate": "YYYY-MM"}],
        "availability": {"status": "Available | Open to Opportunities | Not Available", "type": "Full-time | Part-time | Contract", "startDate": "YYYY-MM-DD"},
        "socialLinks": {"linkedin": "url", "github": "url", "portfolio": "url"}
      }
    `;

    try {
      const aiPromise = geminiService.executeWithRetry(prompt);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI_TIMEOUT")), 90000)
      );

      const result = await Promise.race([aiPromise, timeoutPromise]) as any;
      const response = await result.response;
      const output = response.text();
      
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI response did not contain valid metadata.");
      
      const data = JSON.parse(jsonMatch[0]);

      // --- ATOMIC PERSISTENCE QUEUE ---
      // We use a sequential queue for the duplicate check and save operation to prevent race conditions
      // during parallel ingestion (e.g., when multiple files for the same person are uploaded).
      return await queueExtraction(async () => {
          // Re-verify in DB now that we are in the sequential queue
          const email = (data.email || "").toLowerCase().trim();
          let isDuplicate = false;
          let originalId = null;
          let similarity = 0;

          if (email) {
            const emailMatch = await Applicant.findOne({ ownerId, email });
            if (emailMatch) {
                isDuplicate = true;
                originalId = emailMatch._id;
                similarity = 100;
            }
          }

          // Semantic Fallback if no email match
          if (!isDuplicate && data.name) {
            const potentialMatches = await Applicant.find({
              ownerId,
              name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') }
            }).limit(3);

            if (potentialMatches.length > 0) {
              const comparisonPrompt = `
                Task: Compare two candidate resume summaries and determine if they represent the same person.
                Candidate A (New): ${data.technicalProfile}
                Candidate B (Existing): ${potentialMatches[0].technicalProfile}
                Respond only with JSON: { "isSamePerson": boolean, "similarity": number }
              `;
              try {
                const compResult = await geminiService.executeWithRetry(comparisonPrompt);
                const compText = (await compResult.response).text();
                const compData = JSON.parse(compText.match(/\{[\s\S]*\}/)?.[0] || '{"isSamePerson": false}');
                if (compData.isSamePerson && compData.similarity > 85) {
                  isDuplicate = true;
                  originalId = potentialMatches[0]._id;
                  similarity = compData.similarity;
                }
              } catch (e) {}
            }
          }

          // Generate PDF if not present (CSV/Link/Text ingestion)
          let finalResumeUrl = resumeUrl;
          let isAiGenerated = false;
          if (!finalResumeUrl) {
            try {
              const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 6);
              const pdfFileName = `AI-CV-${uniqueId}.pdf`;
              finalResumeUrl = await pdfService.generateApplicantResume(data, pdfFileName);
              isAiGenerated = true;
            } catch (pdfErr) {
              console.error("[PDF GENERATION FAULT]:", pdfErr);
            }
          }

          const applicant = new Applicant({
            // Legacy Support (Populate for backward compatibility)
            name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : (data.name || source.replace(/\.[^/.]+$/, "")),
            email: email || fallbackEmail || `external-${crypto.randomUUID().substring(0, 8)}@registry.extern`,
            role: data.headline || data.role || "Technical Professional",
            location: data.location || "Remote / Global",
            experience: data.bio || "Verified Profile",
            technicalProfile: rawText.substring(0, 5000), // Keep a robust technical context
            
            // Talent Profile Specification Fields
            firstName: data.firstName,
            lastName: data.lastName,
            headline: data.headline,
            bio: data.bio,
            skills: data.skills || [],
            languages: data.languages || [],
            workExperience: data.workExperience || [],
            education: data.education || [],
            certifications: data.certifications || [],
            projects: data.projects || [],
            availability: data.availability,
            socialLinks: data.socialLinks,

            resumeText: rawText,
            resumeUrl: finalResumeUrl,
            ownerId,
            isDuplicate,
            isAiGenerated,
            originalCandidateId: originalId,
            similarityScore: similarity,
            profileStatus: isDuplicate ? "Duplicate" : "Pending"
          });

          return await applicant.save();
      });
    } catch (e) {
      console.error("[AI DATA EXTRACTION FAULT]:", e);
      return null;
    }
  }

  async deleteApplicant(id: string) {
    const result = await Applicant.findByIdAndDelete(id);
    
    // --- REACTIVE AUDIT ---
    await Applicant.updateMany(
      { originalCandidateId: id },
      { 
        $set: { 
          isDuplicate: false, 
          profileStatus: "Verified",
          similarityScore: 0
        },
        $unset: { originalCandidateId: "" }
      }
    );
    
    return result;
  }

  async deleteApplicantsBulk(ids: string[]) {
    const result = await Applicant.deleteMany({ _id: { $in: ids } });
    
    // Cleanup duplicate links for all deleted IDs
    await Applicant.updateMany(
      { originalCandidateId: { $in: ids } },
      { 
        $set: { 
          isDuplicate: false, 
          profileStatus: "Verified",
          similarityScore: 0
        },
        $unset: { originalCandidateId: "" }
      }
    );
    
    return result;
  }

  /**
   * Duplicate Resolution Protocol:
   * Discards one of the conflicting profiles after administrative confirmation.
   */
  async resolveDuplicate(id: string, action: "keep_original" | "keep_new") {
    const duplicateProfile = await Applicant.findById(id);
    if (!duplicateProfile) throw new Error("Technical Registry Fault: Duplicate profile not found.");

    if (action === "keep_original") {
      // Preference: Discard the new duplicate and retain the primary record
      console.log(`[DUPLICATE RESOLUTION] Discarding new duplicate: ${id}`);
      return await Applicant.findByIdAndDelete(id);
    } else {
      // Preference: Replace the legacy record with the new ingestion
      const originalId = duplicateProfile.originalCandidateId;
      console.log(`[DUPLICATE RESOLUTION] Replacing legacy profile ${originalId} with new profile ${id}`);
      
      if (originalId) {
        await Applicant.findByIdAndDelete(originalId);
      }

      // Finalize the new profile as the primary entry
      duplicateProfile.isDuplicate = false;
      duplicateProfile.originalCandidateId = undefined;
      duplicateProfile.profileStatus = "Verified";
      return await duplicateProfile.save();
    }
  }
}

export default new ApplicantsService();
