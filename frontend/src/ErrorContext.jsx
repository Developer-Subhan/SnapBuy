import { createContext, useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import ErrorPage from "./ErrorPage";

const ErrorContext = createContext();

export const ErrorProvider = () => {
  const [error, setError] = useState(null);

  const resetError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {error ? (
        <ErrorPage error={error} resetError={resetError} />
      ) : (
        <Outlet />
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) throw new Error("useError must be used within an ErrorProvider");
  return context;
};