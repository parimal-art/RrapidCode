import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosclient";
import { Send, Bot, User } from 'lucide-react';

function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        {role: 'model', parts:[{text:`Hi, How are you`}]}
        //{role:'user', parts: [{text:"I am Good"}]}
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const { register, handleSubmit, reset, formState: {errors} } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const simulateTyping = (text, onChunk) => {
        const words = text.split(' ');
        let currentIndex = 0;
        
        const interval = setInterval(() => {
            if (currentIndex < words.length) {
                onChunk(words.slice(0, currentIndex + 1).join(' '));
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 30);
    };

    const onSubmit = async (data) => {
        setMessages(prev => [...prev, { role: 'user', parts: [{text:data.message}]}]);
        reset();
        setIsTyping(true);

        const tempMessageIndex = messages.length + 1;
        setMessages(prev => [...prev, { role: 'model', parts: [{text: ''}], temp: true }]);

        try {
            const response = await axiosClient.post("/ai/chat", {
                message: data.message,
                title: problem.title,
                description: problem.description,
                testcase: problem.visibleTestCase,
                startcode: problem.startCode,
                referenceSolution: problem.referenceSolution
            });   

            const fullText = response.data.message || response.data.content;
            
            simulateTyping(fullText, (partialText) => {
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[tempMessageIndex] = { 
                        role: 'model', 
                        parts: [{text: partialText}]
                    };
                    return newMessages;
                });
            });

        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[tempMessageIndex] = { 
                    role: 'model', 
                    parts: [{text: "Sorry, I encountered an error"}]
                };
                return newMessages;
            });
            setIsTyping(false);
        }
    };

    const formatMessage = (text) => {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
            }
            parts.push({ 
                type: 'code', 
                language: match[1] || 'text', 
                content: match[2].trim() 
            });
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            parts.push({ type: 'text', content: text.slice(lastIndex) });
        }

        return parts.length > 0 ? parts : [{ type: 'text', content: text }];
    };

    const highlightComplexity = (text) => {
        return text.replace(
            /O\([^)]+\)/g, 
            (match) => `<span class="text-yellow-300 font-semibold bg-yellow-900/30 px-1.5 py-0.5 rounded">${match}</span>`
        );
    };

    const renderMessageContent = (text) => {
        const parts = formatMessage(text);
        
        return parts.map((part, idx) => {
            if (part.type === 'code') {
                return (
                    <div key={idx} className="my-3">
                        <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-t-md border border-slate-700">
                            <span className="text-xs text-slate-400">{part.language}</span>
                        </div>
                        <pre className="bg-slate-900 p-3 rounded-b-md overflow-x-auto border border-t-0 border-slate-700">
                            <code className="text-sm text-cyan-300 font-mono">
                                {part.content}
                            </code>
                        </pre>
                    </div>
                );
            }
            
            const textWithComplexity = highlightComplexity(part.content);
            const lines = textWithComplexity.split('\n').map((line, lineIdx) => {
                if (line.trim().match(/^#+\s/)) {
                    return `<div key=${lineIdx} class="font-bold text-lg mt-3 mb-2 text-cyan-300">${line.replace(/^#+\s/, '')}</div>`;
                }
                if (line.trim().match(/^\*\*.*\*\*$/)) {
                    return `<div key=${lineIdx} class="font-semibold text-slate-100 mt-2">${line.replace(/\*\*/g, '')}</div>`;
                }
                if (line.trim().match(/^[-*]\s/)) {
                    return `<div key=${lineIdx} class="ml-4 mb-1">• ${line.replace(/^[-*]\s/, '')}</div>`;
                }
                return line;
            }).join('\n');
            
            return (
                <div 
                    key={idx} 
                    className="whitespace-pre-wrap" 
                    dangerouslySetInnerHTML={{ __html: lines }}
                />
            );
        });
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px] bg-gradient-to-b from-[#060712] via-[#071023] to-[#05060a] text-slate-100 rounded-lg border border-slate-800 shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/40">
                <div className="p-2 rounded-md bg-slate-800 border border-slate-700">
                    <Bot className="w-5 h-5 text-cyan-300"/>
                </div>
                <div>
                    <div className="text-sm text-slate-400">RapidMind</div>
                    <div className="text-lg font-semibold">Ask RapidMind</div>
                </div>
                <div className="ml-auto text-xs text-slate-500">AI · Live</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === "user" ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-cyan-600/20 border border-cyan-600/30 text-cyan-100' : 'bg-slate-800 border border-slate-700 text-slate-200'}`}>
                            {msg.role === 'user' ? (
                                <div className="break-words">{msg.parts[0].text}</div>
                            ) : (
                                <div className="prose prose-invert max-w-none">
                                    {renderMessageContent(msg.parts[0].text)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-lg">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="sticky bottom-0 p-4 bg-slate-900/60 border-t border-slate-800">
                <div className="flex items-center gap-2">
                    <input 
                        placeholder="Ask RapidMind anything..." 
                        className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 placeholder:text-slate-400" 
                        {...register("message", { required: true, minLength: 2 })}
                        disabled={isTyping}
                    />
                    <button 
                        type="submit" 
                        className="p-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition disabled:opacity-50" 
                        disabled={errors.message || isTyping}
                    >
                        <Send className="w-5 h-5 text-black" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;
