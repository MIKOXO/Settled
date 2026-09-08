import { useEffect, useRef, useState } from 'react';

const useFormErrors = (duration = 6000) => {
  const [blockError, setBlockErrorState] = useState(null);
  const [fieldErrors, setFieldErrorsState] = useState({});
  const blockTimer = useRef(null);
  const fieldTimers = useRef({});

  useEffect(
    () => () => {
      clearTimeout(blockTimer.current);
      Object.values(fieldTimers.current).forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  const scheduleClear = (field) => {
    fieldTimers.current[field] = setTimeout(() => {
      setFieldErrorsState((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }, duration);
  };

  const setFieldErrors = (errors) => {
    Object.values(fieldTimers.current).forEach((timer) => clearTimeout(timer));
    fieldTimers.current = {};
    setFieldErrorsState(errors);
    Object.keys(errors).forEach((field) => {
      if (errors[field]) scheduleClear(field);
    });
  };

  const clearFieldError = (field) => {
    clearTimeout(fieldTimers.current[field]);
    delete fieldTimers.current[field];
    setFieldErrorsState((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setBlockError = (message) => {
    clearTimeout(blockTimer.current);
    setBlockErrorState(message);
    if (message) {
      blockTimer.current = setTimeout(() => setBlockErrorState(null), duration);
    }
  };

  const clearBlockError = () => {
    clearTimeout(blockTimer.current);
    setBlockErrorState(null);
  };

  return {
    blockError,
    fieldErrors,
    setFieldErrors,
    clearFieldError,
    setBlockError,
    clearBlockError,
  };
};

export default useFormErrors;