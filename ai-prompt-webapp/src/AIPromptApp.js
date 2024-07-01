import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Book, Lightbulb, Code, Moon, Sun, Download, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AIPromptApp = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [selectedAI, setSelectedAI] = useState('chrome');
  const [history, setHistory] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const textareaRef = useRef(null);

  const serverURL = 'http://192.168.0.12:3001';
  const commonPrompts = [
    { icon: <Sparkles className="w-4 h-4 mr-2" />, text: "Explícame como si tuviera 5 años..." },
    { icon: <Book className="w-4 h-4 mr-2" />, text: "Resume este texto:" },
    { icon: <Lightbulb className="w-4 h-4 mr-2" />, text: "Dame ideas para..." },
    { icon: <Code className="w-4 h-4 mr-2" />, text: "Escribe un código en Python para..." },
  ];

  useEffect(() => {
    adjustTextareaHeight();
    document.body.className = theme;
  }, [prompt, theme]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResponse('');
    setError(null);

    try {
      if (selectedAI === 'chrome') {
        const res = await fetch(`${serverURL}/api/prompt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, selectedAI }),
        });
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setResponse(data.response);
        // Actualizar el historial después de recibir la respuesta completa
        setHistory(prevHistory => [...prevHistory, { prompt, response: data.response }]);
      } else if (selectedAI === 'llama3') {
        const response = await fetch(`${serverURL}/api/prompt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, selectedAI }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              fullResponse += data.response || '';
              setResponse(fullResponse);
              if (data.done) {
                setIsLoading(false);
              }
            }
          }
        }
        // Actualizar el historial después de recibir la respuesta completa
        setHistory(prevHistory => [...prevHistory, { prompt, response: fullResponse }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`Error al procesar la solicitud: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const loadConversation = (index) => {
    const conversation = history[index];
    setPrompt(conversation.prompt);
    setResponse(conversation.response);
    setIsMenuOpen(false);
  };





  const exportConversationToMarkdown = () => {
    const markdownContent = `
# Conversación con Mini Joao

## Pregunta:
${prompt}

## Respuesta:
${response}
    `;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'conversacion_mini_joao.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-blue-400 to-purple-600' : 'bg-gradient-to-br from-gray-900 to-indigo-900'} flex items-center justify-center p-4 transition-all duration-300`}>

      {/* Menú desplegable */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
        <Button
          onClick={toggleMenu}
          className="absolute top-4 right-4 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 rounded-full p-2"
        >
          <X className="w-6 h-6" />
        </Button>
        <div className="p-6 overflow-y-auto h-full">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Historial</h2>
          {history.map((item, index) => (
            <div
              key={index}
              onClick={() => loadConversation(index)}
              className={`cursor-pointer p-2 rounded mb-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-700'}`}
            >
              <p className={`font-semibold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>{item.prompt.substring(0, 30)}...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Botón para abrir el menú */}
      <Button
        onClick={toggleMenu}
        className={`fixed top-4 left-4 z-40 ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-all duration-300 rounded-full p-3`}
      >
        <Menu className="w-6 h-6" />
      </Button>




      <Card className={`w-full max-w-4xl shadow-2xl ${theme === 'light' ? 'bg-white bg-opacity-95' : 'bg-gray-800 bg-opacity-95'} backdrop-blur-lg transition-all duration-300 overflow-hidden rounded-2xl`}>
        <CardHeader className={`${theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-indigo-800 to-purple-900'} text-white relative p-8`}>
          <CardTitle className="text-4xl font-bold text-center flex items-center justify-center">
            <span className="mr-3 text-5xl">🐥</span>
            Pregúntale a Mini Joao
            <span className="ml-3 text-5xl">🐥</span>
          </CardTitle>
          <Button
            onClick={toggleTheme}
            className="absolute top-4 right-4 bg-transparent hover:bg-white hover:bg-opacity-20 transition-all duration-300 rounded-full p-2"
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </Button>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSelectedAI('chrome')}
                      className={`mr-2 px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300 ${selectedAI === 'chrome' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                      Gemini
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white text-gray-800 border border-gray-200 shadow-md p-2 rounded">
                    <p>Mini Joao más rápido de respuesta breve</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSelectedAI('llama3')}
                      className={`ml-2 px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300 ${selectedAI === 'llama3' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                      Llama3
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white text-gray-800 border border-gray-200 shadow-md p-2 rounded">
                    <p>Mini Joao más lento de respuesta progresiva y extensa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full px-6 py-4 rounded-2xl border-2 ${theme === 'light' ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 text-gray-800' : 'border-gray-600 focus:ring-purple-500 focus:border-purple-500 bg-gray-700 text-white'} transition duration-300 ease-in-out resize-none overflow-hidden text-lg shadow-inner`}
                placeholder={`¿Qué quieres saber hoy? (Usando ${selectedAI === 'chrome' ? 'Gemini' : 'Llama3'})`}
                rows={1}
                style={{ minHeight: '60px' }}
              />
              <Button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className={`absolute right-3 top-3 ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-all duration-300 rounded-full p-3`}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </Button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {commonPrompts.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                className={`text-sm px-4 py-2 rounded-full ${theme === 'light' ? 'bg-white hover:bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'} transition-all duration-300 shadow-md`}
                onClick={() => setPrompt(prompt => `${item.text} ${prompt}`)}
              >
                {item.icon}
                {item.text}
              </Button>
            ))}
          </div>

          <Card className={`mt-10 ${theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-gradient-to-br from-gray-800 to-indigo-900'} border-none shadow-lg rounded-2xl overflow-hidden`}>
            <CardContent className="p-8">
              {response ? (
                <div className={`prose max-w-none latex-styles ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-4 text-lg leading-relaxed" {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ?
                          <code className={`px-1 py-0.5 ${theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-gray-700 text-gray-200'} rounded`} {...props} /> :
                          <pre className={`p-4 ${theme === 'light' ? 'bg-blue-800 text-white' : 'bg-gray-900 text-gray-200'} rounded-lg overflow-x-auto my-4 shadow-inner`} {...props} />,
                      h1: ({ node, ...props }) => <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-blue-800' : 'text-gray-200'} mb-4`} {...props} />,
                      h2: ({ node, ...props }) => <h2 className={`text-2xl font-semibold ${theme === 'light' ? 'text-blue-700' : 'text-gray-300'} mb-3`} {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
                    }}
                  >
                    {response}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className={`${theme === 'light' ? 'text-blue-600' : 'text-gray-400'} text-xl text-center`}>Aún no hay respuesta. Haz una pregunta para comenzar nuestra conversación.</p>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={exportConversationToMarkdown}
            className={`mt-6 ${theme === 'light' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-700 hover:bg-green-600'} text-white transition-all duration-300 rounded-full px-6 py-3 text-lg font-semibold shadow-lg`}
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar a Markdown
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPromptApp;