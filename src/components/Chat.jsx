// import { useForm } from 'react-hook-form';
// import { useRef, useState, useEffect } from 'react';
// import { IoMdSend } from 'react-icons/io';
// import { FaMicrophone } from 'react-icons/fa';
// import { useDispatch, useSelector } from 'react-redux';
// import { sendChatMessageAsync } from '../features/chat/ChatThunk';
// import { currentMessage } from '../features/chat/ChatSelectors';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import { Link } from 'react-router-dom';

// const Chat = () => {
//     const dispatch = useDispatch();
//     const msg = useSelector(currentMessage);
//     const { register, handleSubmit, reset } = useForm();
//     const [messages, setMessages] = useState([]);
//     const [copiedIndex, setCopiedIndex] = useState(null);
//     const [isRecording, setIsRecording] = useState(false);
//     const mediaRecorderRef = useRef(null);
//     const chunksRef = useRef([]);
//     const messagesEndRef = useRef(null);

//     const onSubmit = (data) => {
//         const content = data.prompt.trim();
//         if (!content) return;
//         const userMessage = { role: 'user', content };
//         const typingMessage = { role: 'assistant', content: 'Typing ...' };
//         setMessages((prev) => [...prev, userMessage, typingMessage]);
//         dispatch(sendChatMessageAsync({ prompt: content }));
//         reset();
//     };

//     useEffect(() => {
//         if (!msg) return;
//         setMessages((prev) => {
//             const updated = [...prev];
//             const typingIndex = updated.findLastIndex(
//                 (m) => m.role === 'assistant' && m.content === 'Typing ...'
//             );
//             if (typingIndex !== -1) {
//                 updated[typingIndex] = { role: 'assistant', content: msg };
//             } else {
//                 updated.push({ role: 'assistant', content: msg });
//             }
//             return updated;
//         });
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [msg]);

//     const copyToClipboard = (code, index) => {
//         navigator.clipboard.writeText(code);
//         setCopiedIndex(index);
//         setTimeout(() => setCopiedIndex(null), 1500);
//     };

//     const renderMessage = (text) => {
//         const parts = text.split(/```(?:[a-zA-Z]*)?\n?/g);
//         const result = [];

//         for (let i = 0; i < parts.length; i++) {
//             if (i % 2 === 0) {
//                 if (parts[i].trim()) {
//                     result.push(
//                         <p key={`text-${i}`} className="whitespace-pre-wrap mb-2">{parts[i]}</p>
//                     );
//                 }
//             } else {
//                 result.push(
//                     <div key={`code-${i}`} className="relative">
//                         <button
//                             onClick={() => copyToClipboard(parts[i], i)}
//                             className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
//                         >
//                             {copiedIndex === i ? 'Copied!' : 'Copy'}
//                         </button>
//                         <SyntaxHighlighter
//                             language="javascript"
//                             style={oneDark}
//                             customStyle={{ borderRadius: '0.75rem', padding: '1rem' }}
//                         >
//                             {parts[i]}
//                         </SyntaxHighlighter>
//                     </div>
//                 );
//             }
//         }

//         return result;
//     };

//     const startRecording = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             const mediaRecorder = new MediaRecorder(stream);
//             mediaRecorderRef.current = mediaRecorder;
//             chunksRef.current = [];

//             mediaRecorder.ondataavailable = (e) => {
//                 if (e.data.size > 0) {
//                     chunksRef.current.push(e.data);
//                 }
//             };

//             mediaRecorder.onstop = () => {
//                 const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
//                 const url = URL.createObjectURL(blob);
//                 const audio = new Audio(url);
//                 audio.play();
//             };

//             mediaRecorder.start();
//             setIsRecording(true);
//         } catch (err) {
//             console.error('Microphone access denied', err);
//         }
//     };

//     const stopRecording = () => {
//         if (mediaRecorderRef.current) {
//             mediaRecorderRef.current.stop();
//             setIsRecording(false);
//         }
//     };

//     const toggleRecording = () => {
//         isRecording ? stopRecording() : startRecording();
//     };

//     return (
//         <div className="pt-16 fixed inset-0 bg-[#0f172a] text-white flex flex-col md:flex-row gap-4 px-4">
//             <aside className="hidden md:flex flex-col w-1/4 bg-[#0f1d2a] rounded-xl p-6 shadow-xl">
//                 <div className="bg-white text-black font-bold w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4">
//                     VA
//                 </div>
//                 <h2 className="text-center font-semibold text-lg">You are talking to a ChatBOT</h2>
//                 <p className="text-sm text-center mt-4 text-gray-300">
//                     Ask about Knowledge, Business, Education, etc. Avoid sharing personal info.
//                 </p>
//                 <div className="mt-auto flex flex-col gap-4">
//                     <Link
//                         to="/chat/history"
//                         className="text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
//                     >
//                         See History
//                     </Link>
//                     <button
//                         onClick={() => setMessages([])}
//                         className="bg-red-400 hover:bg-red-500 text-white font-semibold py-2 rounded-lg"
//                     >
//                         Clear Conversation
//                     </button>
//                 </div>
//             </aside>

//             <main className="flex-1 flex flex-col bg-[#1e293b] rounded-xl shadow-xl overflow-hidden">
//                 <div className="text-xl font-semibold text-center py-4 border-b border-gray-700">
//                     Model - GPT 3.5 Turbo
//                 </div>

//                 <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scroll-smooth">
//                     {messages.map((msg, idx) => (
//                         <div
//                             key={idx}
//                             className={`max-w-[80%] px-5 py-3 rounded-xl text-base leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
//                                 ? 'bg-blue-600 text-white self-end ml-auto'
//                                 : 'bg-gray-700 text-gray-100 self-start mr-auto'
//                                 }`}
//                         >
//                             {renderMessage(msg.content)}
//                         </div>
//                     ))}
//                     <div ref={messagesEndRef} />
//                 </div>

//                 {/* Updated form with mic before input */}
//                 <form
//                     onSubmit={handleSubmit(onSubmit)}
//                     className="flex items-center bg-[#0f1d2a] px-4 py-3 border-t border-gray-700"
//                 >
//                     <button
//                         type="button"
//                         onClick={toggleRecording}
//                         className={`text-white text-xl mr-3 ${isRecording ? 'text-red-500 animate-pulse' : 'hover:text-blue-400'}`}
//                         title="Record voice"
//                     >
//                         <FaMicrophone />
//                     </button>

//                     <input
//                         {...register('prompt')}
//                         type="text"
//                         placeholder="Send a message..."
//                         className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-base px-2"
//                     />

//                     <button type="submit" className="text-white text-2xl ml-3 hover:text-blue-400">
//                         <IoMdSend />
//                     </button>
//                 </form>
//             </main>
//         </div>
//     );
// };

// export default Chat;































































































import { useForm } from 'react-hook-form';
import { useRef, useState, useEffect } from 'react';
import { IoMdSend } from 'react-icons/io';
import { FaMicrophone } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessageAsync } from '../features/chat/ChatThunk';
import { currentMessage } from '../features/chat/ChatSelectors';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Link } from 'react-router-dom';

const Chat = () => {
    const dispatch = useDispatch();
    const msg = useSelector(currentMessage);
    const { register, handleSubmit, reset, setValue } = useForm();
    const [messages, setMessages] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const messagesEndRef = useRef(null);

    // For speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    const onSubmit = (data) => {
        const content = data.prompt.trim();
        if (!content) return;
        const userMessage = { role: 'user', content };
        const typingMessage = { role: 'assistant', content: 'Typing ...' };
        setMessages((prev) => [...prev, userMessage, typingMessage]);
        dispatch(sendChatMessageAsync({ prompt: content }));
        reset();
    };

    useEffect(() => {
        if (!msg) return;
        setMessages((prev) => {
            const updated = [...prev];
            const typingIndex = updated.findLastIndex(
                (m) => m.role === 'assistant' && m.content === 'Typing ...'
            );
            if (typingIndex !== -1) {
                updated[typingIndex] = { role: 'assistant', content: msg };
            } else {
                updated.push({ role: 'assistant', content: msg });
            }
            return updated;
        });
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msg]);

    const copyToClipboard = (code, index) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const renderMessage = (text) => {
        const parts = text.split(/```(?:[a-zA-Z]*)?\n?/g);
        const result = [];

        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                if (parts[i].trim()) {
                    result.push(
                        <p key={`text-${i}`} className="whitespace-pre-wrap mb-2">{parts[i]}</p>
                    );
                }
            } else {
                result.push(
                    <div key={`code-${i}`} className="relative">
                        <button
                            onClick={() => copyToClipboard(parts[i], i)}
                            className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                        >
                            {copiedIndex === i ? 'Copied!' : 'Copy'}
                        </button>
                        <SyntaxHighlighter
                            language="javascript"
                            style={oneDark}
                            customStyle={{ borderRadius: '0.75rem', padding: '1rem' }}
                        >
                            {parts[i]}
                        </SyntaxHighlighter>
                    </div>
                );
            }
        }

        return result;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.play();
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Microphone access denied', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const toggleRecording = () => {
        if (!recognition) {
            alert('Speech recognition not supported in this browser.');
            return;
        }

        if (isRecording) {
            stopRecording();
            recognition.stop();
        } else {
            startRecording();

            recognition.continuous = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Transcribed text:', transcript);
                setValue('prompt', transcript); // fill the input with transcribed text
            };

            recognition.onerror = (e) => {
                console.error('Speech recognition error', e);
            };

            recognition.start();
        }
    };

    return (
        <div className="pt-16 fixed inset-0 bg-[#0f172a] text-white flex flex-col md:flex-row gap-4 px-4">
            <aside className="hidden md:flex flex-col w-1/4 bg-[#0f1d2a] rounded-xl p-6 shadow-xl">
                <div className="bg-white text-black font-bold w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4">
                    VA
                </div>
                <h2 className="text-center font-semibold text-lg">You are talking to a ChatBOT</h2>
                <p className="text-sm text-center mt-4 text-gray-300">
                    Ask about Knowledge, Business, Education, etc. Avoid sharing personal info.
                </p>
                <div className="mt-auto flex flex-col gap-4">
                    <Link
                        to="/chat/history"
                        className="text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
                    >
                        See History
                    </Link>
                    <button
                        onClick={() => setMessages([])}
                        className="bg-red-400 hover:bg-red-500 text-white font-semibold py-2 rounded-lg"
                    >
                        Clear Conversation
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col bg-[#1e293b] rounded-xl shadow-xl overflow-hidden">
                <div className="text-xl font-semibold text-center py-4 border-b border-gray-700">
                    Model - GPT 3.5 Turbo
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scroll-smooth">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`max-w-[80%] px-5 py-3 rounded-xl text-base leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-blue-600 text-white self-end ml-auto'
                                : 'bg-gray-700 text-gray-100 self-start mr-auto'
                                }`}
                        >
                            {renderMessage(msg.content)}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex items-center bg-[#0f1d2a] px-4 py-3 border-t border-gray-700"
                >
                    <button
                        type="button"
                        onClick={toggleRecording}
                        className={`text-white text-xl mr-3 ${isRecording ? 'text-red-500 animate-pulse' : 'hover:text-blue-400'}`}
                        title="Record voice"
                    >
                        <FaMicrophone />
                    </button>

                    <input
                        {...register('prompt')}
                        type="text"
                        placeholder="Send a message..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-base px-2"
                    />

                    <button type="submit" className="text-white text-2xl ml-3 hover:text-blue-400">
                        <IoMdSend />
                    </button>
                </form>
            </main>
        </div>
    );
};

export default Chat;
