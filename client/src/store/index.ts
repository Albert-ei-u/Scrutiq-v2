import { configureStore } from "@reduxjs/toolkit";
import jobsReducer from "./slices/jobsSlice";
import applicantsReducer from "./slices/applicantsSlice";
import screeningReducer from "./slices/screeningSlice";

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    applicants: applicantsReducer,
    screening: screeningReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
