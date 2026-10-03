import { useCallback, useEffect, useRef, useState } from 'react';

const RESET_MS = 2500;

const copyViaExecCommand = (text) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.className = 'pointer-events-none fixed opacity-0';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
};

const useCopyToClipboard = (text, resetMs = RESET_MS) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = useCallback(async () => {
    if (!text) return;

    let succeeded;
    try {
      await navigator.clipboard.writeText(text);
      succeeded = true;
    } catch {
      succeeded = copyViaExecCommand(text);
    }
    if (!succeeded) return;

    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), resetMs);
  }, [text, resetMs]);

  return { copied, copy };
};

export default useCopyToClipboard;
