import { configureStore, combineReducers } from "@reduxjs/toolkit";
import walletReducer from "./walletSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import watchlistReducer from "./watchListSlice"; // import your new slice
import refreshReducer from "./refreshSlice";

// Configure persistence
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["wallet", "watchlist"], // persist watchlist as well
};

const rootReducer = combineReducers({
  wallet: walletReducer,
  watchlist: watchlistReducer, // Add watchlist reducer here
  refresh: refreshReducer,
  // add other reducers here
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ["wallet.balance.value"], // ignore bigint in balance for serializable check
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
