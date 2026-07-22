import { useState, type FormEvent } from 'react';

import { rokuKeypress, rokuType } from '@/api/ipc';
import { errorFeedback, successFeedback, tapFeedback } from '@/utils/haptics';
import { BackspaceIcon, SendIcon } from '@/components/RemoteIcons';
import { remoteButtonClass, remoteIconClass } from '@/components/Remote';

interface TextEntryProps {
  ip: string;
}

export const TextEntry = ({ ip }: TextEntryProps) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!text || sending) return;
    setSending(true);
    try {
      await rokuType(ip, text);
      setText('');
      successFeedback();
    } catch {
      errorFeedback();
    } finally {
      setSending(false);
    }
  };

  const backspace = () => {
    tapFeedback();
    rokuKeypress(ip, 'Backspace').catch(() => {});
  };

  return (
    <form onSubmit={send} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type on the TV…"
        aria-label="Text to send to the TV"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
        className="min-w-0 flex-1 rounded-lg border border-line bg-transparent px-3 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!text || sending}
        aria-label="Send text"
        title="Send text"
        className={`${remoteButtonClass} w-12 shrink-0 disabled:opacity-40`}
      >
        <SendIcon className={remoteIconClass} />
      </button>
      <button
        type="button"
        onClick={backspace}
        aria-label="Backspace"
        title="Backspace"
        className={`${remoteButtonClass} w-12 shrink-0`}
      >
        <BackspaceIcon className={remoteIconClass} />
      </button>
    </form>
  );
};
