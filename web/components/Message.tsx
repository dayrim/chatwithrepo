import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi";
import { HiUser } from "react-icons/hi";
import { TbCursorText } from "react-icons/tb";
// Instead of importing from 'react-syntax-highlighter/dist/esm/...', use:
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark, dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const decodeUnicode = (str: string) => {
  return str.replace(/\\u[\dA-F]{4}/gi,
    (match: string) => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16)));
};
const CodeBlock = ({ language, code }: any) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: any) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };
  const decodedCode = decodeUnicode(code);

  // @ts-ignore
  return (
    <div className="relative group">
      <SyntaxHighlighter language={language} style={atomDark} customStyle={{
        padding: '1rem',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
      }}>
        {decodedCode}
      </SyntaxHighlighter>
      <button
        onClick={() => copyToClipboard(decodedCode)}
        className="absolute right-2 top-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        {isCopied ? 'Copied' : <FiCopy />}
      </button>
    </div>
  );
};


const Message = (props: any) => {
  const { message } = props;
  const { role, text } = message;

  const isUser = role === "user";

  const segments = text.split(/(```\w*\n[\s\S]*?\n```)/).filter(Boolean);

  const renderSegment = (segment: any, index: any) => {
    const codeMatch = segment.match(/```(\w*)\n([\s\S]*?)\n```/);
    if (codeMatch) {
      const [, language, code] = codeMatch;
      return <CodeBlock key={`code-${index}`} language={language} code={code} />;
    }
    // Render regular text if not a code block
    return <Markdown key={`markdown-${index}`} className={'markdown'} remarkPlugins={[remarkGfm]}>{segment}</Markdown>;
  };

  return (
    <div
      className={`group w-full text-gray-800 dark:text-gray-100 border-b border-black/10 dark:border-gray-900/50 ${isUser ? "dark:bg-white-800" : "bg-gray-50 dark:bg-[#444654]"
        }`}
    >
      <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl flex lg:px-0 m-auto w-full">
        <div className="flex flex-row gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl p-4 md:py-6 lg:px-0 m-auto w-full">
          <div className="w-8 flex flex-col relative items-end">
            <div className="relative h-7 w-7 p-1 rounded-sm text-gray flex items-center justify-center text-opacity-100r">
              {isUser ? (
                <HiUser className="h-4 w-4 text-gray" />
              ) : (
                <HiAcademicCap className="h-4 w-4 text-gray" />
              )}
            </div>
            <div className="text-xs flex items-center justify-center gap-1 absolute left-0 top-2 -ml-4 -translate-x-full group-hover:visible !invisible">
              <button
                disabled
                className="text-gray-300 dark:text-gray-400"
              ></button>
              <span className="flex-grow flex-shrink-0">1 / 1</span>
              <button
                disabled
                className="text-gray-300 dark:text-gray-400"
              ></button>
            </div>
          </div>
          <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
            <div className="flex flex-grow flex-col gap-3">
              <div className="flex flex-col items-start gap-4 whitespace-pre-wrap break-words">
                <div className="list-disc w-full break-words ">
                  {!isUser && (text === null || text === "") ? (
                    <TbCursorText className="h-6 w-6 animate-pulse" />
                  ) : (
                    segments.map(renderSegment)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
