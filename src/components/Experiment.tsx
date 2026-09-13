import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload } from 'lucide-react';
import { EXPERT_RESPONSES } from '../data';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CASE_ID = "active_demo_case";

type ThreadMessage = {
  role: 'evaluator' | 'mat';
  text: string;
  requestXrf?: boolean;
};

export function Experiment() {
  const [participant, setParticipant] = useState<keyof typeof EXPERT_RESPONSES | null>(null);
  
  // DB State
  const [dbState, setDbState] = useState<any>(null);

  // --- MAT'S FORM STATE (ORIGINATOR) ---
  const [matPhoto, setMatPhoto] = useState<string | null>(null);
  const [matLocation, setMatLocation] = useState('');
  const [matContext, setMatContext] = useState('');
  const [matQuestion, setMatQuestion] = useState('');
  const [matHasXrf, setMatHasXrf] = useState<boolean | null>(null);
  const [matXrfPhoto, setMatXrfPhoto] = useState<string | null>(null);
  const [matUvPhoto, setMatUvPhoto] = useState<string | null>(null);
  const [matReplies, setMatReplies] = useState<Record<string, string>>({});
  const [matChallenges, setMatChallenges] = useState<Record<string, string>>({});

  // --- EVALUATOR FORM STATE ---
  const [evalResponse, setEvalResponse] = useState(''); // Initial interpretation
  const [requestMoreData, setRequestMoreData] = useState(false);
  const [moreDataText, setMoreDataText] = useState('');
  const [requestXrf, setRequestXrf] = useState(false);
  const [finalResponse, setFinalResponse] = useState(''); // Final interpretation
  const [probability, setProbability] = useState('');

  // Sync with Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "cases", CASE_ID), (docSnap) => {
      if (docSnap.exists()) {
        setDbState(docSnap.data());
      } else {
        setDbState(null);
      }
    });
    return () => unsub();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (data: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
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
        
        setter(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        console.error("Failed to load image");
      };

      img.src = objectUrl;
    }
  };

  const handleMatSubmitCase = async () => {
    await setDoc(doc(db, "cases", CASE_ID), {
      isCreated: true,
      photoData: matPhoto,
      location: matLocation,
      context: matContext,
      question: matQuestion,
      hasXrf: matHasXrf,
      xrfData: matXrfPhoto,
      uvPhotoData: null,
      responses: {}
    }, { merge: true });
  };

  const handleMatReply = async (evaluatorId: string) => {
    const currentResponse = dbState?.responses?.[evaluatorId];
    if (!currentResponse) return;

    const replyText = matReplies[evaluatorId] || 'No further info to give.';

    const updates: any = {
      responses: {
        [evaluatorId]: {
          thread: [...(currentResponse.thread || []), { role: 'mat', text: replyText }],
          status: 'evaluating-evidence'
        }
      }
    };

    if (matUvPhoto) updates.uvPhotoData = matUvPhoto;
    if (matXrfPhoto) updates.xrfData = matXrfPhoto;

    await setDoc(doc(db, "cases", CASE_ID), updates, { merge: true });
    setMatReplies(prev => ({ ...prev, [evaluatorId]: '' }));
  };

  const handleMatAccept = async (evaluatorId: string) => {
    await setDoc(doc(db, "cases", CASE_ID), {
      responses: {
        [evaluatorId]: {
          status: 'sealed'
        }
      }
    }, { merge: true });
  };

  const handleMatChallenge = async (evaluatorId: string) => {
    const currentResponse = dbState?.responses?.[evaluatorId];
    if (!currentResponse) return;

    const challengeText = matChallenges[evaluatorId] || 'I disagree with this interpretation.';

    const updates: any = {
      responses: {
        [evaluatorId]: {
          thread: [...(currentResponse.thread || []), { role: 'mat', text: `DISAGREEMENT/CHALLENGE: ${challengeText}` }],
          status: 'evaluating-evidence'
        }
      }
    };

    await setDoc(doc(db, "cases", CASE_ID), updates, { merge: true });
    setMatChallenges(prev => ({ ...prev, [evaluatorId]: '' }));
  };

  const handleEvaluatorSubmitRequest = async (isInitial: boolean) => {
    if (!participant) return;
    const currentResponse = dbState?.responses?.[participant] || {};
    const currentThread = currentResponse.thread || [];

    const newMsg: ThreadMessage = {
      role: 'evaluator',
      text: moreDataText,
    };
    if (isInitial) newMsg.requestXrf = requestXrf;

    const payload: any = {
      thread: [...currentThread, newMsg],
      status: 'awaiting-field'
    };

    if (isInitial) {
      payload.initialResponse = evalResponse;
    }

    await setDoc(doc(db, "cases", CASE_ID), {
      responses: {
        [participant]: payload
      }
    }, { merge: true });

    setMoreDataText('');
    setRequestXrf(false);
  };

  const handleEvaluatorSubmitFinal = async (isInitial: boolean) => {
    if (!participant) return;
    const currentResponse = dbState?.responses?.[participant] || {};

    const payload: any = {
      probability: probability,
      status: 'pending-originator-approval'
    };

    if (isInitial) {
      payload.initialResponse = evalResponse;
      payload.finalResponse = evalResponse; 
    } else {
      payload.finalResponse = finalResponse;
    }

    await setDoc(doc(db, "cases", CASE_ID), {
      responses: {
        [participant]: payload
      }
    }, { merge: true });
  };

  const handleResetExperiment = async () => {
    await setDoc(doc(db, "cases", CASE_ID), {
      isCreated: false,
      photoData: null,
      location: '',
      context: '',
      question: '',
      hasXrf: null,
      xrfData: null,
      uvPhotoData: null,
      responses: {}
    });
    setMatPhoto(null);
    setMatLocation('');
    setMatContext('');
    setMatQuestion('');
    setMatHasXrf(null);
    setMatXrfPhoto(null);
    setMatUvPhoto(null);
    setMatReplies({});
    setMatChallenges({});
    
    setEvalResponse('');
    setRequestMoreData(false);
    setMoreDataText('');
    setRequestXrf(false);
    setFinalResponse('');
    setProbability('');
    setParticipant(null);
  };

  if (!participant) {
    return (
      <div className="min-h-screen bg-instrument text-instrument-text flex flex-col justify-center px-8 md:px-24">
        <div className="max-w-3xl flex justify-between items-end mb-16">
          <h2 className="font-display text-4xl md:text-6xl tracking-tight">WHO ARE YOU ENTERING AS?</h2>
          {dbState?.isCreated && (
            <button onClick={handleResetExperiment} className="font-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-white pb-2 border-b border-transparent hover:border-white transition-all">
              RESET EXPERIMENT
            </button>
          )}
        </div>
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

  const isOriginator = participant === 'mat';
  const caseExists = dbState?.isCreated;
  const myEvalData = dbState?.responses?.[participant];
  const evalStatus = myEvalData?.status || 'viewing';
  
  const anyAwaitingField = Object.values(dbState?.responses || {}).some((r: any) => r.status === 'awaiting-field');
  const anyPendingApproval = Object.values(dbState?.responses || {}).some((r: any) => r.status === 'pending-originator-approval');

  return (
    <div className="min-h-screen bg-instrument text-instrument-text flex flex-col md:flex-row relative">
      
      {/* LEFT COLUMN: VISUAL SPECIMEN */}
      <div className="md:w-1/2 h-[50vh] md:h-screen sticky top-0 border-b md:border-b-0 md:border-r border-neutral-800 p-8 flex flex-col">
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-neutral-900 overflow-hidden flex items-center justify-center">
             
             {isOriginator && !caseExists && !matPhoto ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 m-8 text-neutral-500 hover:text-white hover:border-white transition-colors cursor-pointer">
                 <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, setMatPhoto)} />
                 <Upload className="w-8 h-8 mb-4 opacity-50" />
                 <p className="font-mono text-xs tracking-widest uppercase text-center px-4">UPLOAD FIELD PHOTOGRAPH<br/>(Normal Light)</p>
               </div>
             ) : (
               <>
                 <div 
                    className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${dbState?.photoData || matPhoto})`,
                      opacity: dbState?.uvPhotoData ? 0 : 1 
                    }}
                 />
                 {dbState?.uvPhotoData && (
                   <div 
                      className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${dbState.uvPhotoData})`,
                        opacity: 1 
                      }}
                   />
                 )}
               </>
             )}
             
             {(dbState?.photoData || matPhoto) && (
               <div className="z-10 font-mono text-xs tracking-widest text-neutral-400 absolute bottom-4 left-4">
                 {dbState?.uvPhotoData ? 'ADDITIONAL PHOTOGRAPH' : 'NORMAL LIGHT'}
               </div>
             )}
          </div>
        </div>
        
        {/* XRF HUD */}
        <div className="h-32 mt-8 flex flex-col justify-end">
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">EVIDENCE / MEASUREMENTS</div>
          <AnimatePresence mode="wait">
            {!dbState?.xrfData && !matXrfPhoto ? (
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
                 {dbState?.xrfData ? (
                   <div>
                     <p>pXRF: DATA SUPPLIED</p>
                     <img src={dbState.xrfData} alt="XRF Data" className="h-16 object-contain mt-2" />
                   </div>
                 ) : matXrfPhoto ? (
                   <div>
                     <p>pXRF: DATA UPLOADED (PENDING SUBMIT)</p>
                     <img src={matXrfPhoto} alt="XRF Pending" className="h-16 object-contain mt-2 opacity-50" />
                   </div>
                 ) : null}
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE LEDGER */}
      <div className="md:w-1/2 p-8 md:p-16 min-h-screen overflow-y-auto">
        <div className="max-w-xl mx-auto flex flex-col gap-16 pb-32">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-4xl">CASE 001</h1>
              <button onClick={() => setParticipant(null)} className="font-mono text-xs text-neutral-500 hover:text-white uppercase tracking-widest transition-colors">
                &larr; Switch Role
              </button>
            </div>
            <div className="pt-8 border-t border-neutral-800">
              <p className="font-mono text-sm text-neutral-500">ENTERING AS: <span className="text-white">{EXPERT_RESPONSES[participant].name}</span></p>
            </div>
          </div>

          {/* ========================================================== */}
          {/* FLOW A: MAT KATHAGEN (ORIGINATOR)                          */}
          {/* ========================================================== */}
          {isOriginator && !caseExists && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">KNOWLEDGE EVENT CREATION</div>
              
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm text-neutral-400">Mine / Location</label>
                  <input 
                    type="text" 
                    value={matLocation}
                    onChange={(e) => setMatLocation(e.target.value)}
                    placeholder="e.g. Andamooka"
                    className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm text-neutral-400">Context (what do you notice nearby/in this particular area?)</label>
                  <textarea 
                    value={matContext}
                    onChange={(e) => setMatContext(e.target.value)}
                    placeholder="Describe the environment..."
                    className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors min-h-[80px] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-sans text-sm text-neutral-400">The Question</label>
                  <textarea 
                    value={matQuestion}
                    onChange={(e) => setMatQuestion(e.target.value)}
                    placeholder="Pose your question..."
                    className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors min-h-[80px] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-4 border-t border-neutral-800">
                  <label className="font-sans text-sm text-neutral-400">Do you have XRF data?</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setMatHasXrf(true)}
                      className={`font-mono text-sm tracking-widest border px-6 py-2 transition-colors ${matHasXrf === true ? 'border-white text-white' : 'border-neutral-700 text-neutral-500 hover:border-neutral-400'}`}
                    >
                      YES
                    </button>
                    <button 
                      onClick={() => setMatHasXrf(false)}
                      className={`font-mono text-sm tracking-widest border px-6 py-2 transition-colors ${matHasXrf === false ? 'border-white text-white' : 'border-neutral-700 text-neutral-500 hover:border-neutral-400'}`}
                    >
                      NO
                    </button>
                  </div>
                  
                  {matHasXrf === true && (
                    <div className="mt-4 p-4 border border-dashed border-neutral-700 flex flex-col items-center justify-center cursor-pointer hover:border-white transition-colors relative group">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, setMatXrfPhoto)} />
                      <Upload className="w-6 h-6 mb-2 opacity-50 group-hover:opacity-100" />
                      <p className="font-mono text-xs tracking-widest text-neutral-400">UPLOAD XRF SCAN (PHOTO)</p>
                    </div>
                  )}
                </div>
              </div>

              {matPhoto && matLocation && matContext && matQuestion && matHasXrf !== null && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleMatSubmitCase}
                  className="font-mono text-sm tracking-widest border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors w-full"
                >
                  SUBMIT KNOWLEDGE EVENT
                </motion.button>
              )}
            </motion.div>
          )}

          {isOriginator && caseExists && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="p-8 border border-neutral-800 text-center space-y-4">
                <p className="font-mono text-sm text-neutral-500 tracking-widest uppercase">Status</p>
                <p className="font-display text-xl text-white">Event Submitted to Provenance Network</p>
              </div>

              {/* REQUESTS FOR MORE INFO */}
              {anyAwaitingField && (
                <div className="space-y-8 p-8 border border-cyan-900 bg-cyan-950/20">
                  <div className="font-mono text-xs uppercase tracking-widest text-cyan-500 mb-6">FOLLOW-UP EVIDENCE REQUESTS</div>
                  
                  <div className="space-y-12">
                    {Object.entries(dbState.responses).map(([k, r]: [string, any]) => {
                      if (r.status === 'awaiting-field') {
                        const lastReq = r.thread[r.thread.length - 1];
                        return (
                          <div key={k} className="border-l border-cyan-800 pl-6 py-2">
                            <p className="font-sans text-sm text-neutral-400">{EXPERT_RESPONSES[k as keyof typeof EXPERT_RESPONSES].name} asks:</p>
                            <p className="font-display text-2xl text-white mt-2 mb-4">"{lastReq.text}"</p>
                            {lastReq.requestXrf && <p className="font-mono text-xs text-cyan-400 mb-4">+ REQUESTED XRF DATA</p>}
                            
                            <div className="flex flex-col gap-4 mt-6">
                              <textarea
                                value={matReplies[k] || ''}
                                onChange={(e) => setMatReplies(prev => ({ ...prev, [k]: e.target.value }))}
                                placeholder="Reply (e.g. 'No further info to give')"
                                className="bg-transparent border-b border-cyan-900 pb-2 font-sans text-cyan-100 focus:outline-none focus:border-cyan-500 min-h-[60px] resize-none"
                              />
                              <button 
                                onClick={() => handleMatReply(k)}
                                disabled={!matReplies[k]}
                                className="font-mono text-xs border border-cyan-500 text-cyan-500 px-4 py-2 hover:bg-cyan-500 hover:text-black transition-colors self-start disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-cyan-500"
                              >
                                SEND REPLY TO {EXPERT_RESPONSES[k as keyof typeof EXPERT_RESPONSES].name.split(' ')[0].toUpperCase()}
                              </button>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-cyan-900/50 mt-8">
                    <p className="font-sans text-sm text-neutral-400">Upload additional evidence (Optional - Updates Global Viewer)</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {!dbState.uvPhotoData && (
                        <div className="p-4 border border-dashed border-cyan-800 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors relative group text-cyan-500">
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, setMatUvPhoto)} />
                          <Upload className="w-6 h-6 mb-2 opacity-50 group-hover:opacity-100" />
                          <p className="font-mono text-[10px] tracking-widest text-center">UPLOAD ADDITIONAL<br/>PHOTO</p>
                        </div>
                      )}
                      {!dbState.hasXrf && !dbState.xrfData && (
                        <div className="p-4 border border-dashed border-cyan-800 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors relative group text-cyan-500">
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, setMatXrfPhoto)} />
                          <Upload className="w-6 h-6 mb-2 opacity-50 group-hover:opacity-100" />
                          <p className="font-mono text-[10px] tracking-widest text-center">UPLOAD XRF<br/>DATA</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PENDING APPROVAL - MAT MUST SEAL */}
              {anyPendingApproval && (
                <div className="space-y-8 p-8 border border-amber-900 bg-amber-950/20 mt-8">
                  <div className="font-mono text-xs uppercase tracking-widest text-amber-500 mb-6">FINAL INTERPRETATIONS REQUIRING APPROVAL</div>
                  
                  <div className="space-y-12">
                    {Object.entries(dbState.responses).map(([k, r]: [string, any]) => {
                      if (r.status === 'pending-originator-approval') {
                        return (
                          <div key={k} className="border-l border-amber-800 pl-6 py-2">
                            <p className="font-sans text-sm text-neutral-400">{EXPERT_RESPONSES[k as keyof typeof EXPERT_RESPONSES].name} proposes:</p>
                            <p className="font-display text-2xl text-white mt-2 mb-2">"{r.finalResponse}"</p>
                            <p className="font-mono text-xs text-amber-400 mb-6">PROBABILITY: {r.probability}</p>
                            
                            <div className="flex flex-col gap-4 mt-6">
                              <p className="font-sans text-sm text-neutral-400">Do you accept this conclusion and seal the event?</p>
                              <textarea
                                value={matChallenges[k] || ''}
                                onChange={(e) => setMatChallenges(prev => ({ ...prev, [k]: e.target.value }))}
                                placeholder="If incorrect, explain why..."
                                className="bg-transparent border-b border-amber-900 pb-2 font-sans text-amber-100 focus:outline-none focus:border-amber-500 min-h-[60px] resize-none"
                              />
                              <div className="flex gap-4 mt-2">
                                <button 
                                  onClick={() => handleMatChallenge(k)}
                                  disabled={!matChallenges[k]}
                                  className="font-mono text-xs border border-amber-500 text-amber-500 px-4 py-3 hover:bg-amber-500 hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-amber-500"
                                >
                                  CHALLENGE & RETURN
                                </button>
                                <button 
                                  onClick={() => handleMatAccept(k)}
                                  className="font-mono text-xs border border-white text-white px-4 py-3 hover:bg-white hover:text-black transition-colors flex-1"
                                >
                                  ACCEPT & SEAL
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* FLOW B: EVALUATOR (NIGEL / DANIELLE)                       */}
          {/* ========================================================== */}
          {!isOriginator && !caseExists && (
            <div className="p-8 border border-neutral-800 text-center space-y-4">
               <p className="font-mono text-sm text-neutral-500 tracking-widest uppercase">NETWORK STATUS</p>
               <p className="font-display text-xl text-neutral-400">Waiting for Originator (Mat) to submit a Knowledge Event.</p>
            </div>
          )}

          {!isOriginator && caseExists && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              
              {/* DISPLAY ORIGINATOR'S CASE */}
              <div className="space-y-6">
                <div className="font-mono text-xs uppercase tracking-widest text-neutral-500">FIELD OBSERVATION (MAT KATHAGEN)</div>
                <div className="bg-neutral-900/50 border border-neutral-800 p-6 space-y-6">
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase block mb-1">Mine / Location</span>
                    <p className="font-sans text-lg text-white">{dbState.location}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase block mb-1">Context</span>
                    <p className="font-sans text-lg text-white">{dbState.context}</p>
                  </div>
                  <div className="pt-4 border-t border-neutral-800">
                    <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase block mb-1">The Question</span>
                    <p className="font-display text-2xl text-white">"{dbState.question}"</p>
                  </div>
                </div>
              </div>

              {/* STAGE 1: INITIAL INTERACTION */}
              {evalStatus === 'viewing' && (
                <div className="space-y-8 pt-8 border-t border-neutral-800">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-sm text-neutral-400">Respond to Mat</label>
                    <textarea 
                      value={evalResponse}
                      onChange={(e) => setEvalResponse(e.target.value)}
                      placeholder="Enter your initial interpretation..."
                      className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <input 
                      type="checkbox" 
                      id="reqData" 
                      checked={requestMoreData} 
                      onChange={(e) => setRequestMoreData(e.target.checked)}
                      className="w-5 h-5 bg-transparent border-neutral-700 checked:bg-white cursor-pointer"
                    />
                    <label htmlFor="reqData" className="font-mono text-sm tracking-widest uppercase cursor-pointer">
                      Request more data
                    </label>
                  </div>

                  {/* BRANCH 1A: Requesting Data */}
                  {requestMoreData && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 border-l-2 border-cyan-800 pl-6 py-2 overflow-hidden">
                      <div className="flex flex-col gap-2">
                        <label className="font-sans text-sm text-cyan-500">What data do you need?</label>
                        <input 
                          type="text" 
                          value={moreDataText}
                          onChange={(e) => setMoreDataText(e.target.value)}
                          placeholder="e.g. UV response, spectroscopic analysis..."
                          className="bg-transparent border-b border-cyan-900 pb-2 text-xl font-display text-cyan-100 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      
                      {!dbState.hasXrf && (
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            id="reqXrf" 
                            checked={requestXrf} 
                            onChange={(e) => setRequestXrf(e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="reqXrf" className="font-sans text-sm text-cyan-400 cursor-pointer">
                            Also request XRF Data
                          </label>
                        </div>
                      )}

                      <button 
                        onClick={() => handleEvaluatorSubmitRequest(true)}
                        disabled={!moreDataText && !requestXrf}
                        className="font-mono text-sm tracking-widest border border-cyan-500 text-cyan-500 px-6 py-3 hover:bg-cyan-500 hover:text-black transition-colors mt-4 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-cyan-500"
                      >
                        SUBMIT REQUEST FOR EVIDENCE
                      </button>
                    </motion.div>
                  )}

                  {/* BRANCH 1B: Ready to Submit Final immediately */}
                  {!requestMoreData && evalResponse && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pt-8 border-t border-neutral-800">
                      <div className="flex flex-col gap-2">
                        <label className="font-sans text-sm text-neutral-400">Probability %</label>
                        <input 
                          type="text" 
                          value={probability}
                          onChange={(e) => setProbability(e.target.value)}
                          placeholder="e.g. 75%"
                          className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors w-32"
                        />
                      </div>

                      <button 
                        onClick={() => handleEvaluatorSubmitFinal(true)}
                        disabled={!probability}
                        className="font-mono text-sm tracking-widest border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white"
                      >
                        SUBMIT FINAL INTERPRETATION
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* AWAITING FIELD RESPONSE STATE */}
              {evalStatus === 'awaiting-field' && (
                <div className="p-8 border border-neutral-800 bg-neutral-900/30 text-center space-y-4">
                   <div className="animate-pulse w-3 h-3 bg-cyan-500 rounded-full mx-auto mb-4" />
                   <p className="font-mono text-sm text-neutral-400 tracking-widest uppercase">AWAITING FIELD RESPONSE FROM MAT KATHAGEN...</p>
                </div>
              )}

              {/* EVALUATING ITERATIVE LOOP */}
              {evalStatus === 'evaluating-evidence' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 border-t border-cyan-900 pt-8 mt-8">
                  <div className="font-mono text-xs uppercase tracking-widest text-cyan-500">CONVERSATION LEDGER</div>
                  
                  {/* Thread History */}
                  <div className="space-y-6 bg-neutral-900/50 p-6 border border-neutral-800 mb-8">
                    {myEvalData.thread?.map((msg: any, idx: number) => {
                      const isChallenge = msg.text.startsWith('DISAGREEMENT/CHALLENGE:');
                      return (
                        <div key={idx} className={`space-y-1 ${msg.role === 'mat' ? (isChallenge ? 'border-l-2 border-amber-500 pl-4' : 'border-l-2 border-cyan-500 pl-4') : 'border-l-2 border-neutral-600 pl-4'}`}>
                          <span className={`font-mono text-[10px] uppercase tracking-widest ${isChallenge ? 'text-amber-500' : 'text-neutral-500'}`}>
                            {msg.role === 'mat' ? 'Mat Kathagen' : 'You'}
                          </span>
                          <p className={`font-sans text-lg ${isChallenge ? 'text-amber-100' : 'text-white'}`}>{isChallenge ? msg.text.replace('DISAGREEMENT/CHALLENGE: ', '') : msg.text}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                    {/* Option A: Request MORE data */}
                    <div className="space-y-6">
                      <h3 className="font-mono text-xs text-cyan-500 tracking-widest uppercase mb-4">A) REQUEST MORE INFO</h3>
                      <div className="flex flex-col gap-2">
                        <textarea 
                          value={moreDataText}
                          onChange={(e) => setMoreDataText(e.target.value)}
                          placeholder="Ask another question..."
                          className="bg-transparent border-b border-cyan-900 pb-2 text-xl font-display text-cyan-100 focus:outline-none focus:border-cyan-500 transition-colors min-h-[60px] resize-none"
                        />
                      </div>
                      <button 
                        onClick={() => handleEvaluatorSubmitRequest(false)}
                        disabled={!moreDataText}
                        className="font-mono text-xs tracking-widest border border-cyan-500 text-cyan-500 px-6 py-3 hover:bg-cyan-500 hover:text-black transition-colors w-full disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-cyan-500"
                      >
                        SUBMIT FURTHER REQUEST
                      </button>
                    </div>

                    {/* Option B: Final Answer */}
                    <div className="space-y-6">
                      <h3 className="font-mono text-xs text-white tracking-widest uppercase mb-4">B) PROPOSE FINAL ANSWER</h3>
                      <div className="flex flex-col gap-2">
                        <label className="font-sans text-sm text-neutral-400">Final Interpretation</label>
                        <textarea 
                          value={finalResponse}
                          onChange={(e) => setFinalResponse(e.target.value)}
                          placeholder="Enter your revised interpretation..."
                          className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors min-h-[80px] resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        <label className="font-sans text-sm text-neutral-400">Final Probability %</label>
                        <input 
                          type="text" 
                          value={probability}
                          onChange={(e) => setProbability(e.target.value)}
                          placeholder="e.g. 85%"
                          className="bg-transparent border-b border-neutral-700 pb-2 text-xl font-display focus:outline-none focus:border-white transition-colors w-32"
                        />
                      </div>

                      <button 
                        onClick={() => handleEvaluatorSubmitFinal(false)}
                        disabled={!finalResponse || !probability}
                        className="font-mono text-xs tracking-widest border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors w-full disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white mt-4"
                      >
                        SUBMIT PROPOSED INTERPRETATION
                      </button>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* AWAITING MAT'S APPROVAL */}
              {evalStatus === 'pending-originator-approval' && (
                <div className="p-8 border border-neutral-800 bg-neutral-900/30 text-center space-y-4">
                   <div className="animate-pulse w-3 h-3 bg-amber-500 rounded-full mx-auto mb-4" />
                   <p className="font-mono text-sm text-neutral-400 tracking-widest uppercase">AWAITING MAT'S APPROVAL...</p>
                   <p className="font-sans text-sm text-neutral-500">The Originator must accept your interpretation to seal the event.</p>
                </div>
              )}

              {/* SEALED STATE */}
              {evalStatus === 'sealed' && (
                <div className="p-8 border border-neutral-800 bg-neutral-900/30 space-y-8 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-white" />
                   <div className="text-center">
                     <p className="font-mono text-sm text-white tracking-widest uppercase mb-2">EVALUATION SEALED</p>
                     <p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">ACCEPTED BY MAT KATHAGEN</p>
                   </div>
                   
                   <div className="space-y-2">
                     <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">INITIAL INTERPRETATION</span>
                     <p className="font-display text-xl text-neutral-400">"{myEvalData.initialResponse}"</p>
                   </div>

                   {myEvalData.thread && myEvalData.thread.length > 0 && (
                     <div className="space-y-4 bg-black/20 p-4 border border-neutral-800">
                        <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">LEDGER HISTORY</span>
                        {myEvalData.thread.map((msg: any, idx: number) => {
                          const isChallenge = msg.text.startsWith('DISAGREEMENT/CHALLENGE:');
                          return (
                            <div key={idx} className={`space-y-1 ${msg.role === 'mat' ? (isChallenge ? 'border-l-2 border-amber-500 pl-3' : 'border-l-2 border-cyan-500 pl-3') : 'border-l-2 border-neutral-600 pl-3'}`}>
                              <span className={`font-mono text-[10px] uppercase tracking-widest ${isChallenge ? 'text-amber-500' : 'text-neutral-500'}`}>
                                {msg.role === 'mat' ? 'Mat Kathagen' : 'You'}
                              </span>
                              <p className={`font-sans text-sm ${isChallenge ? 'text-amber-100' : 'text-neutral-300'}`}>{isChallenge ? msg.text.replace('DISAGREEMENT/CHALLENGE: ', '') : msg.text}</p>
                            </div>
                          )
                        })}
                     </div>
                   )}

                   <div className="space-y-2 pt-4 border-t border-neutral-800">
                     <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">FINAL INTERPRETATION</span>
                     <p className="font-display text-2xl text-white">"{myEvalData.finalResponse}"</p>
                   </div>
                   
                   <div className="mt-6">
                    <p className="font-mono text-sm text-neutral-400">FINAL PROBABILITY: <span className="text-white">{myEvalData.probability}</span></p>
                   </div>
                </div>
              )}

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
