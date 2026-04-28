import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosclient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Zod schema
const tagEnum = z.enum([
  'Array','LinkedList','Graph','Dp','Tree','String','Heap','HashMap','TwoPointers','Math','NumberTheory','HashTable'
]);

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy','medium','hard']),
  tags: z.array(tagEnum).min(1, 'Select at least one tag'),
  visibleTestCases: z.array(z.object({ input: z.string().min(1), output: z.string().min(1), explanation: z.string().min(1) })).min(1),
  hiddenTestCases: z.array(z.object({ input: z.string().min(1), output: z.string().min(1) })).min(1),
  startCode: z.array(z.object({ language: z.enum(['C++','Java','C','Python']), initialCode: z.string().min(1) })).length(4),
  referenceSolution: z.array(z.object({ language: z.enum(['C++','Java','C','Python']), completeCode: z.string().min(1) })).length(4)
});

export default function AdminCreate() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '', description: '', difficulty: 'easy', tags: ['Array'],
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'C', initialCode: '' },
        { language: 'Python', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'C', completeCode: '' },
        { language: 'Python', completeCode: '' }
      ]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  const mapPayloadToSchema = (data) => ({
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    tags: data.tags,
    visibleTestCase: data.visibleTestCases,
    invisibleTestCase: data.hiddenTestCases,
    startCode: data.startCode.map((s) => ({ language: s.language, InitialCode: s.initialCode })),
    referenceSolution: data.referenceSolution.map((r) => ({ language: r.language, CompleteCode: r.completeCode }))
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = mapPayloadToSchema(data);
      await axiosClient.post('/problem/create', payload);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(`Create failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

  const tabs = [
    { id: 'basic', label: 'Basic', icon: '📝' },
    { id: 'test-cases', label: 'Tests', icon: '🧪' },
    { id: 'code', label: 'Code', icon: '💻' },
    { id: 'review', label: 'Review', icon: '✅' }
  ];

  // common attractive button classes used across UI
  const btnBase = 'cursor-pointer inline-flex items-center justify-center transition transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1';
  const btnPrimary = `${btnBase} bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 ring-cyan-500`;
  const btnGhost = `${btnBase} bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2`;
  const btnAccent = `${btnBase} bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1`;
  const btnWarn = `${btnBase} bg-amber-600 hover:bg-amber-500 text-white px-3 py-1`;
  const btnDanger = `${btnBase} bg-rose-600 hover:bg-rose-500 text-white px-2 py-1`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071023] via-[#081428] to-[#05060a] text-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <h1 className="text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-violet-400 mb-2">Create Problem</h1>
          <p className="text-sm text-slate-400 mb-6">Dark mode editor. Clean contrast. Clear focus states.</p>
        </motion.div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`${btnBase} text-sm font-medium ${activeTab===t.id? 'bg-slate-800 border border-slate-700 shadow-sm text-slate-100':'text-slate-200'} px-3 py-2`}>
                {t.icon} <span className="ml-2">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => {}} className={`${btnGhost} px-3 py-2`}>Import</button>
            <button onClick={() => {}} className={`${btnGhost} px-3 py-2`}>Preview</button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'basic' && (
              <motion.section key="basic" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-slate-100">Basic Info</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-1">Title</label>
                    <input {...register('title')} className={`w-full px-4 py-2 rounded-md bg-slate-800 border ${errors.title? 'border-rose-600':'border-slate-700'} text-slate-100`} placeholder="Enter title" />
                    {errors.title && <div className="text-rose-400 text-sm mt-1">{errors.title.message}</div>}
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 block mb-1">Description</label>
                    <textarea {...register('description')} className={`w-full px-4 py-3 rounded-md bg-slate-800 border ${errors.description? 'border-rose-600':'border-slate-700'} text-slate-100 h-40`} placeholder="Problem description" />
                    {errors.description && <div className="text-rose-400 text-sm mt-1">{errors.description.message}</div>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-300 block mb-1">Difficulty</label>
                      <select {...register('difficulty')} className="w-full px-4 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 block mb-1">Tags</label>
                      <select {...register('tags')} multiple className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 h-36">
                        {tagEnum.options.map((t) => <option key={t} value={t} className="bg-slate-800 text-slate-100">{t}</option>)}
                      </select>
                      {errors.tags && <div className="text-rose-400 text-sm mt-1">{errors.tags.message?.toString()}</div>}
                      <div className="text-xs text-slate-500 mt-2">Use Ctrl/Cmd to multi-select.</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setActiveTab('test-cases')} className={`${btnPrimary}`}>Next: Tests →</button>
                </div>

              </motion.section>
            )}

            {activeTab === 'test-cases' && (
              <motion.section key="tests" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-slate-100">Test Cases</h2>

                <div className="mb-4 flex justify-between items-center">
                  <div className="text-slate-300">Visible test cases</div>
                  <button type="button" onClick={() => appendVisible({ input: '', output: '', explanation: '' })} className={`${btnAccent}`}>+ Add</button>
                </div>

                <div className="space-y-3">
                  {visibleFields.map((f, i) => (
                    <div key={f.id} className="bg-slate-800 border border-slate-700 rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-slate-100 font-medium">Visible #{i+1}</div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => removeVisible(i)} className={`${btnDanger}`}>Remove</button>
                        </div>
                      </div>

                      <textarea {...register(`visibleTestCases.${i}.input`)} placeholder="Input" className="w-full bg-transparent text-slate-100 border border-slate-700 rounded-md p-2 mb-2 h-20 font-mono" />
                      <textarea {...register(`visibleTestCases.${i}.output`)} placeholder="Output" className="w-full bg-transparent text-slate-100 border border-slate-700 rounded-md p-2 mb-2 h-20 font-mono" />
                      <textarea {...register(`visibleTestCases.${i}.explanation`)} placeholder="Explanation" className="w-full bg-transparent text-slate-100 border border-slate-700 rounded-md p-2 h-20" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 mb-2 flex justify-between items-center">
                  <div className="text-slate-300">Hidden test cases</div>
                  <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className={`${btnWarn}`}>+ Add</button>
                </div>

                <div className="space-y-3">
                  {hiddenFields.map((f,i) => (
                    <div key={f.id} className="bg-slate-800 border border-slate-700 rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-slate-100 font-medium">Hidden #{i+1}</div>
                        <button type="button" onClick={() => removeHidden(i)} className={`${btnDanger}`}>Remove</button>
                      </div>
                      <textarea {...register(`hiddenTestCases.${i}.input`)} placeholder="Input" className="w-full bg-transparent text-slate-100 border border-slate-700 rounded-md p-2 mb-2 h-20 font-mono" />
                      <textarea {...register(`hiddenTestCases.${i}.output`)} placeholder="Output" className="w-full bg-transparent text-slate-100 border border-slate-700 rounded-md p-2 h-20 font-mono" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setActiveTab('basic')} className={`${btnGhost}`}>← Back</button>
                  <button type="button" onClick={() => setActiveTab('code')} className={`${btnPrimary}`}>Next: Code →</button>
                </div>

              </motion.section>
            )}

            {activeTab === 'code' && (
              <motion.section key="code" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-slate-100">Code Templates</h2>

                {[0,1,2,3].map((idx) => (
                  <div key={idx} className="mb-6 bg-slate-800 border border-slate-700 rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-slate-100 font-medium">{idx===0?'C++':idx===1?'Java':idx===2?'C':'Python'}</div>
                      <span className="text-xs text-slate-400">Starter + Solution</span>
                    </div>
                    <textarea {...register(`startCode.${idx}.initialCode`)} placeholder="Starter code" className="w-full bg-transparent text-slate-100 border border-slate-700 rounded-md p-3 h-48 font-mono mb-3" />
                    <textarea {...register(`referenceSolution.${idx}.completeCode`)} placeholder="Reference solution" className="w-full bg-transparent text-slate-100 border border-slate-700 rounded-md p-3 h-48 font-mono" />
                  </div>
                ))}

                <div className="mt-4 flex justify-between">
                  <button type="button" onClick={() => setActiveTab('test-cases')} className={`${btnGhost}`}>← Back</button>
                  <button type="button" onClick={() => setActiveTab('review')} className={`${btnAccent}`}>Review →</button>
                </div>

              </motion.section>
            )}

            {activeTab === 'review' && (
              <motion.section key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-slate-100">Review & Submit</h2>

                <div className="space-y-3">
                  <div className="bg-slate-800 border border-slate-700 rounded-md p-4 flex items-center justify-between">
                    <div>
                      <div className="text-slate-100 font-medium">{watch('title') || 'Untitled'}</div>
                      <div className="text-slate-400 text-sm">{(watch('description')||'').slice(0,120)}</div>
                    </div>
                    <div className="text-sm text-slate-400">Difficulty: {watch('difficulty')}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-md p-4">
                      <div className="text-slate-200 font-medium mb-2">Testcases</div>
                      <div className="text-slate-400 text-sm">Visible: {visibleFields.length} · Hidden: {hiddenFields.length}</div>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-md p-4">
                      <div className="text-slate-200 font-medium mb-2">Languages</div>
                      <div className="text-slate-400 text-sm">C++, Java, C, Python</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setActiveTab('code')} className={`${btnGhost}`}>← Back</button>
                  <button type="submit" className={`${btnAccent} px-4 py-3`} disabled={isSubmitting}  >{isSubmitting? 'Creating...':'Create Problem'}</button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}

