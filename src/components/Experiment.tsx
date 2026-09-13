import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload } from 'lucide-react';
import { EXPERT_RESPONSES } from '../data';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

type Phase = 'SEE' | 'JUDGE' | 'ASK' | 'EVIDENCE' | 'REASSESS' | 'REVEAL';

const CASE_ID = "active_demo_case";

export function Experiment() {
  const [participant, setParticipant] = useState<keyof typeof EXPERT_RESPONSES | null>(null);
  const [phase, setPhase] = useState<Phase>('SEE');
  
  // DB State
  const [dbState, setDbState] = useState<any>(null);

  // Form State
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [caseQuestion, setCaseQuestion] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [basis, setBasis] = useState('');
  const [probability, setProbability] = useState('');
  const [evidenceRequest, setEvidenceRequest] = useState('');
  const [newInterpretation, setNewInterpretation] = useState('');
  const [newProbability, setNewProbability] = useState('');
  const [whyChange, setWhyChange] = useState('');

  // Sync with Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "cases", CASE_ID), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDbState(data);
        if (data.photoData && !uploadedPhoto) setUploadedPhoto(data.photoData);
        if (data.question && !caseQuestion) setCaseQuestion(data.question);
      } else {
        setDbState(null);
      }
    });
    return () => unsub();
  }, [uploadedPhoto, caseQuestion]);

  if (!participant) {
    return (
      <div className="min-h-screen bg-instrument text-instrument-text flex flex-col justify-center px-8 md:px-24">
        <h2 className="font-display text-4xl md:text-6xl mb-16 tracking-tight">WHO ARE YOU ENTERING AS?</h2>
        <div className="flex flex-col gap-12 max-w-3xl">
          {Object.entries(EXPERT_RESPONSES).map(([key, data]) => (
            <button 
              key={key}
              onClick={() => setParticipant(key as keyof typeof EXPERT_RESPONSES)}
              className="group text-left flex flex-col items-start focus:outline-none"
            >
              <span className="font-display text-3xl md:text-5xl group-hover:opacity-50 transition-opacity">{data.name}</span>
              <span className="font-mono text-sm uppercase tracking-widest text-neutral-500 mt-2">{data.role}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const saveResponseToDb = async (newPhase: Phase) => {
    if (!participant) return;
    const responseData = {
      interpretation,
      basis,
      probability,
      evidenceRequest,
      newInterpretation,
      newProbability,
      phase: newPhase
    };
    
    // If we're creating the case for the first time (usually Mat)
    if (participant === 'mat' && newPhase === 'JUDGE' && (!dbState || !dbState.photoData)) {
      await setDoc(doc(db, "cases", CASE_ID), {
        photoData: uploadedPhoto,
        question: caseQuestion,
        responses: {
          [participant]: responseData
        }
      }, { merge: true });
    } else {
      // Just update the response
      await setDoc(doc(db, "cases", CASE_ID), {
        responses: {
          [participant]: responseData
        }
      }, { merge: true });
    }
  };

  const handleLockJudgement = async () => {
    setPhase('ASK');
    await saveResponseToDb('ASK');
  };
  
  const handleRequestEvidence = async () => {
    setPhase('EVIDENCE');
    await saveResponseToDb('EVIDENCE');
  };
  
  const handleLockReassessment = async () => {
    setPhase('REVEAL');
    await saveResponseToDb('REVEAL');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl); // Clean up memory
        
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG to ensure it fits in Firestore document limit (1MB)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setUploadedPhoto(dataUrl);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        console.error("Failed to load image for compression");
      };

      img.src = objectUrl;
    }
  };

  const canProceedFromSee = uploadedPhoto && caseQuestion;

  return (
    <div className="min-h-screen bg-instrument text-instrument-text flex flex-col md:flex-row relative">
      
      {/* Left: Specimen Viewer (Sticky) */}
      <div className="md:w-1/2 h-[50vh] md:h-screen sticky top-0 border-b md:border-b-0 md:border-r border-neutral-800 p-8 flex flex-col">
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-neutral-900 overflow-hidden flex items-center justify-center">
             {!uploadedPhoto ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 m-8 text-neutral-500 hover:text-white hover:border-white transition-colors cursor-pointer">
                 <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                 <Upload className="w-8 h-8 mb-4 opacity-50" />
                 <p className="font-mono text-xs tracking-widest uppercase">UPLOAD FIELD PHOTOGRAPH</p>
               </div>
             ) : (
               <>
                 {/* Normal Image */}
                 <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${uploadedPhoto})`,
                      opacity: phase === 'EVIDENCE' || phase === 'REASSESS' || phase === 'REVEAL' ? 0 : 1 
                    }}
                 />
                 {/* UV Image (Cyan multiply blend) */}
                 <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${uploadedPhoto})`,
                      opacity: phase === 'EVIDENCE' || phase === 'REASSESS' || phase === 'REVEAL' ? 1 : 0 
                    }}
                 >
                   <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#06B6D4] mix-blend-screen opacity-70" />
                 </div>
               </>
             )}
             <div className="z-10 font-mono text-xs tracking-widest text-neutral-400 absolute bottom-4 left-4">
               {phase === 'EVIDENCE' || phase === 'REASSESS' || phase === 'REVEAL' ? '365 NM UV' : 'NORMAL LIGHT'}
             </div>
          </div>
        </div>
        
        <div className="h-32 mt-8 flex flex-col justify-end">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">EVIDENCE / MEASUREMENTS</div>
          <AnimatePresence mode="wait">
            {phase === 'SEE' || phase === 'JUDGE' || phase === 'ASK' ? (
               <motion.div 
                 key="no-xrf"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="font-mono text-sm text-neutral-400"
               >
                 pXRF: NO XRF DATA SUPPLIED
               </motion.div>
            ) : (
               <motion.div 
                 key="xrf-data"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="font-mono text-sm text-cyan-400 space-y-1"
               >
                 <div>pXRF: TRACE ACTIVATORS NEGATIVE</div>
                 <div>U: &lt;LOD</div>
                 <div>Cu: &lt;LOD</div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: The Ledger (Scrollable) */}
      <div className="md:w-1/2 p-8 md:p-16 min-h-screen">
        <div className="max-w-xl mx-auto flex flex-col gap-24 pb-32">
          
          <div className="space-y-4">
            <h1 className="font-display text-4xl">CASE 001</h1>
            {phase === 'SEE' && (!dbState || !dbState.question) && participant === 'mat' ? (
               <div className="flex flex-col gap-2 mt-4">
                  <label className="font-mono text-xs uppercase tracking-widest text-neutral-500">FIELD QUESTION (MAT KATHAGEN)</label>
                  <input 
                    type="text" 
                    value={caseQuestion}
                    onChange={(e) => setCaseQuestion(e.target.value)}
                    placeholder="Pose a question about this specimen..."
                    className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-sans focus:outline-none focus:border-white transition-colors"
                  />
               </div>
            ) : (
               <div className="flex flex-col gap-2 mt-4">
                  <label className="font-mono text-xs uppercase tracking-widest text-neutral-500">FIELD QUESTION (MAT KATHAGEN)</label>
                  <p className="font-sans text-xl text-neutral-400">{caseQuestion || (dbState?.question) || 'Waiting for Mat...'}</p>
               </div>
            )}
            <div className="pt-8 border-t border-neutral-800">
              <p className="font-mono text-sm text-neutral-500">ENTERING AS: <span className="text-white">{EXPERT_RESPONSES[participant].name}</span></p>
            </div>
          </div>

          {phase === 'SEE' && canProceedFromSee && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={async () => {
                setPhase('JUDGE');
                if (participant === 'mat' && (!dbState || !dbState.photoData)) {
                  await setDoc(doc(db, "cases", CASE_ID), {
                    photoData: uploadedPhoto,
                    question: caseQuestion
                  }, { merge: true });
                }
              }}
              className="font-mono text-sm tracking-widest border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors"
            >
              ENTER JUDGEMENT
            </motion.button>
          )}

          {/* JUDGE PHASE */}
          {(phase !== 'SEE') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">01 / INITIAL JUDGEMENT</div>
              
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm text-neutral-400">What do you think is happening?</label>
                  {phase === 'JUDGE' ? (
                    <input 
                      type="text" 
                      value={interpretation}
                      onChange={(e) => setInterpretation(e.target.value)}
                    placeholder="Enter interpretation..."
                    className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors"
                  />
                ) : (
                  <p className="text-xl font-display pb-2 border-b border-transparent">{interpretation}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm text-neutral-400">Basis of interpretation</label>
                {phase === 'JUDGE' ? (
                  <input 
                    type="text" 
                    value={basis}
                    onChange={(e) => setBasis(e.target.value)}
                    placeholder="Visual heuristics, physics..."
                    className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors"
                  />
                ) : (
                  <p className="text-xl font-display pb-2 border-b border-transparent">{basis}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm text-neutral-400">Confidence / Probability</label>
                {phase === 'JUDGE' ? (
                  <input 
                    type="text" 
                    value={probability}
                    onChange={(e) => setProbability(e.target.value)}
                    placeholder="e.g. 60%"
                    className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors"
                  />
                ) : (
                  <p className="text-xl font-display pb-2 border-b border-transparent">{probability}</p>
                )}
              </div>
            </div>

              {phase === 'JUDGE' && interpretation && basis && probability && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleLockJudgement}
                  className="font-mono text-sm tracking-widest border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors"
                >
                  LOCK INITIAL JUDGEMENT
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ASK PHASE */}
          {(phase === 'ASK' || phase === 'EVIDENCE' || phase === 'REASSESS' || phase === 'REVEAL') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">02 / INFORMATION NEED</div>
              
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm text-neutral-400">What evidence would help?</label>
                  {phase === 'ASK' ? (
                    <input 
                      type="text" 
                      value={evidenceRequest}
                      onChange={(e) => setEvidenceRequest(e.target.value)}
                      placeholder="e.g. pXRF to identify trace activators"
                      className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors"
                    />
                  ) : (
                    <p className="text-xl font-display pb-2 border-b border-transparent">{evidenceRequest}</p>
                  )}
                </div>
              </div>

              {phase === 'ASK' && evidenceRequest && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleRequestEvidence}
                  className="font-mono text-sm tracking-widest border border-cyan-500 text-cyan-500 px-6 py-3 hover:bg-cyan-500 hover:text-black transition-colors"
                >
                  REQUEST EVIDENCE
                </motion.button>
              )}
            </motion.div>
          )}

          {/* REASSESS PHASE */}
          {(phase === 'EVIDENCE' || phase === 'REASSESS' || phase === 'REVEAL') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="font-mono text-xs uppercase tracking-widest text-cyan-500">EVIDENCE ARRIVED. REASSESS.</div>
              
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm text-neutral-400">New Interpretation</label>
                  {phase === 'EVIDENCE' || phase === 'REASSESS' ? (
                    <input 
                      type="text" 
                      value={newInterpretation}
                      onChange={(e) => { setNewInterpretation(e.target.value); setPhase('REASSESS'); }}
                      placeholder="How does this change things?"
                      className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors"
                    />
                  ) : (
                    <p className="text-xl font-display pb-2 border-b border-transparent">{newInterpretation}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm text-neutral-400">New Probability</label>
                  {phase === 'EVIDENCE' || phase === 'REASSESS' ? (
                    <input 
                      type="text" 
                      value={newProbability}
                      onChange={(e) => setNewProbability(e.target.value)}
                      placeholder="e.g. 85%"
                      className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors"
                    />
                  ) : (
                    <p className="text-xl font-display pb-2 border-b border-transparent">{newProbability}</p>
                  )}
                </div>
              </div>

              {phase === 'REASSESS' && newInterpretation && newProbability && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleLockReassessment}
                  className="font-mono text-sm tracking-widest border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors"
                >
                  LOCK REASSESSMENT
                </motion.button>
              )}
            </motion.div>
          )}

          {/* REVEAL PHASE */}
          {phase === 'REVEAL' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 pt-16 border-t border-neutral-800">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-8">INDEPENDENT RESPONSES</div>
              
              {Object.entries(EXPERT_RESPONSES).filter(([k]) => k !== participant).map(([key, data]) => {
                const dbResponse = dbState?.responses?.[key];
                
                if (dbResponse && dbResponse.phase === 'REVEAL') {
                  return (
                    <div key={key} className="space-y-4 opacity-50 hover:opacity-100 transition-opacity">
                      <div className="font-mono text-sm">{data.name} / {data.role}</div>
                      <div className="font-display text-xl border-l border-neutral-700 pl-4">
                        <p className="text-neutral-300">"{dbResponse.interpretation}"</p>
                        <p className="font-mono text-xs mt-2 text-neutral-500">PROBABILITY: {dbResponse.probability} &rarr; {dbResponse.newProbability ? `REASSESSED: ${dbResponse.newProbability}` : ''}</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={key} className="space-y-4 opacity-30">
                      <div className="font-mono text-sm">{data.name} / {data.role}</div>
                      <div className="font-display text-xl border-l border-neutral-700 pl-4">
                        <p className="text-neutral-500 font-mono text-sm">WAITING FOR EXPERT REVEAL...</p>
                      </div>
                    </div>
                  );
                }
              })}
              
              <div className="pt-16">
                <p className="font-display text-4xl md:text-5xl">THE CONCLUSION CAN MOVE.</p>
                <p className="font-display text-4xl md:text-5xl text-neutral-500">THE HISTORY STAYS.</p>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
