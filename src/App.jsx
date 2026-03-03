import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Users, Zap, FileSpreadsheet, ShieldCheck, Layers, Hash, ChevronDown, Plus, Minus, Loader2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { classesData } from './data';

export default function App() {
  const [productMode, setProductMode] = useState('Both');
  const [censusType, setCensusType] = useState('Quotes');
  const [composition, setComposition] = useState('Employee + Spouse');
  const [ichraCount, setIchraCount] = useState(5);
  const [shopCount, setShopCount] = useState(5);
  const [numFiles, setNumFiles] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSSN = () => {
    const area = Math.floor(Math.random() * 199) + 500;
    return `${area}-${Math.floor(Math.random() * 89) + 11}-${Math.floor(Math.random() * 8999) + 1001}`;
  };

  const getRandomDate = (startYear, endYear) => {
    const year = Math.floor(Math.random() * (endYear - startYear)) + startYear;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return { str: `${month}/${day}/${year}`, year };
  };

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const generateCensus = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    try {
      for (let f = 1; f <= numFiles; f++) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Census_Data');
        const isQuote = censusType === 'Quotes';

        // 1. ADD BLANK ROW AT ROW 1
        sheet.addRow([]);

        // 2. DEFINE COLUMNS WITHOUT THE 'header' PROPERTY
        // This prevents ExcelJS from automatically writing to Row 1.
        const colDefs = isQuote ? [
          { key: 'buffer', width: 5 }, { key: 'id', width: 15 }, { key: 'ln', width: 20 },
          { key: 'fn', width: 20 }, { key: 'mType', width: 15 }, { key: 'zip', width: 12 },
          { key: 'dob', width: 15 }, { key: 'income', width: 25 }, { key: 'className', width: 25 },
          { key: 'cPrem', width: 25 }, { key: 'rPrem', width: 25 }
        ] : [
          { key: 'buffer', width: 5 }, { key: 'id', width: 15 }, { key: 'ln', width: 20 },
          { key: 'fn', width: 20 }, { key: 'email', width: 30 }, { key: 'mType', width: 15 },
          { key: 'ssn', width: 18 }, { key: 'dob', width: 15 }, { key: 'age', width: 10 },
          { key: 'gender', width: 10 }, { key: 'dis', width: 10 }, { key: 'doh', width: 15 },
          { key: 'income', width: 25 }, { key: 'className', width: 25 }, { key: 'a1', width: 30 }, { key: 'a2', width: 30 },
          { key: 'city', width: 20 }, { key: 'zip', width: 12 }, { key: 'state', width: 20 },
          { key: 'mHome', width: 25 },  { key: 'paper', width: 25 }, { key: 'cStart', width: 25 }, { key: 'cPrem', width: 25 },
          { key: 'rPrem', width: 25 }
        ];

        sheet.columns = colDefs;

        // 3. MANUALLY INSERT HEADERS AT ROW 2
        const headers = isQuote
          ? ['', 'EE ID', 'Last Name', 'First Name', 'Member Type', 'Zip Code', 'DOB', 'Annual Household Income', 'Class Name', 'Current Group Plan Premium', 'Renewal Group Plan Premium']
          : [
            '', 'EE ID', 'Last Name', 'First Name', 'Email', 'Member Type', 'SSN',
            'Date of Birth', 'Age', 'Gender', 'Disabled', 'Date of Hire',
            'Annual Household Income', 'Class Name', 'Address Line 1', 'Apt/Floor # Line 2', 'City',
            'Zip Code', 'State', 'Mailing Same as Home (yes/no)',
            'Paperless (yes/no)', 'Contribution Start Date', 'Current Group Plan Premium', 'Renewal Group Plan Premium'
          ];

        const headerRow = sheet.getRow(2);
        headerRow.values = headers;
        headerRow.font = { bold: true, size: 12 };

        // 4. GENERATE POOL AND DATA (Starting from Row 3 automatically)
        const employeePool = [];
        if (productMode === 'ICHRA' || productMode === 'Both') for (let i = 0; i < ichraCount; i++) employeePool.push('ICHRA');
        if (productMode === 'Small Group' || productMode === 'Both') for (let i = 0; i < shopCount; i++) employeePool.push('SHOP');

        employeePool.forEach((prodType) => {
          const eeId = Math.floor(Math.random() * 89999) + 10000;
          const sharedLastName = getRandom(lastNames);
          const randomClass = getRandom(classesData.filter(c => c.productLineCd === prodType));
          const tiers = composition === 'Employee Only' ? ['Employee'] :
            composition === 'Employee + Spouse' ? ['Employee', 'Spouse'] :
              ['Employee', 'Spouse', 'Child'];

          tiers.forEach((tier, tIdx) => {
            const fn = getRandom(firstNames);
            const isEE = tier === 'Employee';
            const dobObj = getRandomDate(1965, 2004);
            sheet.addRow({
              buffer: '', id: eeId, ln: sharedLastName, fn: fn,
              email: `${fn.toLowerCase()}.${sharedLastName.toLowerCase()}${eeId}${tIdx}@yopmail.com`,
              mType: tier, ssn: generateSSN(), dob: dobObj.str, age: 2026 - dobObj.year,
              zip: '06106', income: isEE ? (Math.floor(Math.random() * 50000) + 30000).toFixed(2) : '',
              className: isEE ? randomClass.name : '', gender: getRandom(['M', 'F']), dis: 'N',
              doh: isEE ? '01/15/2024' : '', a1: '1 Main St', a2: '', city: 'Hartford', state: 'Connecticut',
              mHome: 'yes', paper: 'yes', cStart: isEE ? '06/01/2026' : '',
              cPrem: isEE ? (Math.floor(Math.random() * 5000) + 1000).toFixed(2) : '',
              rPrem: isEE ? (Math.floor(Math.random() * 5000) + 1100).toFixed(2) : ''
            });
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${productMode}_Census_${f}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-200 flex flex-col p-4 md:px-8 md:py-6 relative overflow-y-auto">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.03),transparent_70%)]" />

      <header className="flex flex-col md:flex-row justify-between items-center mb-6 w-full px-2 gap-4 z-10">
        <motion.div initial="initial" whileHover="hover" className="flex items-center gap-3 cursor-pointer">
          <motion.div
            variants={{ initial: { rotate: 0 }, hover: { rotate: 360 } }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="p-3 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl"
          >
            <FileSpreadsheet className="text-purple-400" size={28} />
          </motion.div>
          <motion.h1
            animate={{ filter: ["drop-shadow(0 0 2px #a855f7)", "drop-shadow(0 0 8px #a855f7)", "drop-shadow(0 0 2px #a855f7)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-2xl font-black text-white uppercase tracking-tighter italic"
          >
            CENSUS<span className="text-purple-400">TURBO</span>
          </motion.h1>
        </motion.div>

        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <ShieldCheck size={14} className="text-green-500" /> V: 3.2.1_LITE
        </div>
      </header>

      {/* Main Grid: Reduced gap and padding */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 w-full z-10">
        {/* PANEL 1: Mode Select */}
        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-4 glass-card rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl min-h-fit">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><Zap size={16} /> Mode</h2>
          <div className="flex flex-col gap-3">
            <button onClick={() => setProductMode('ICHRA')} className={`py-4 rounded-2xl text-xs font-black transition-all border ${productMode === 'ICHRA' ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg' : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:border-cyan-500'}`}>ICHRA ONLY</button>
            <button onClick={() => setProductMode('Small Group')} className={`py-4 rounded-2xl text-xs font-black transition-all border ${productMode === 'Small Group' ? 'bg-purple-500 text-white border-purple-400 shadow-lg' : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:border-purple-500'}`}>SMALL GROUP ONLY</button>
            <button onClick={() => setProductMode('Both')} className={`py-4 rounded-2xl text-xs font-black transition-all border ${productMode === 'Both' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-white/20' : 'bg-slate-800/40 text-slate-400 border-slate-700'}`}>HYBRID BOTH</button>
          </div>
          <div className="pt-6 mt-auto border-t border-slate-800/40">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Format</h2>
            <div className="flex gap-3">
              {['Quotes', 'Census'].map((t) => (
                <button key={t} onClick={() => setCensusType(t)} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all border ${censusType === t ? 'bg-slate-100 text-slate-900 border-white' : 'bg-slate-800/40 text-slate-500 border-slate-700'}`}>{t}</button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* PANEL 2: Distribution */}
        <motion.section layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-4 glass-card rounded-[2.5rem] p-8 flex flex-col min-h-fit shadow-2xl">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3"><Users size={16} /> Population</h2>
          <div className="space-y-6 flex-1 flex flex-col">
            <AnimatePresence mode="popLayout">
              {(productMode === 'ICHRA' || productMode === 'Both') && (
                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key="ichra" className="p-6 bg-cyan-950/10 rounded-[2rem] border border-cyan-500/10">
                  <div className="flex justify-between items-center mb-4 text-[9px] uppercase font-black tracking-widest text-cyan-500"><span>ICHRA EEs</span><span className="text-2xl">{ichraCount}</span></div>
                  <input type="range" min="0" max="100" value={ichraCount} onChange={(e) => setIchraCount(parseInt(e.target.value))} style={{ accentColor: '#06b6d4' }} className="w-full h-1.5 cursor-pointer" />
                </motion.div>
              )}
              {(productMode === 'Small Group' || productMode === 'Both') && (
                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key="shop" className="p-6 bg-purple-950/10 rounded-[2rem] border border-purple-500/10">
                  <div className="flex justify-between items-center mb-4 text-[9px] uppercase font-black tracking-widest text-purple-500"><span>SHOP EEs</span><span className="text-2xl">{shopCount}</span></div>
                  <input type="range" min="0" max="100" value={shopCount} onChange={(e) => setShopCount(parseInt(e.target.value))} style={{ accentColor: '#a855f7' }} className="w-full h-1.5 cursor-pointer" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-6 mt-auto">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-3 ml-1">Composition</label>
              <div className="relative group">
                <select value={composition} onChange={(e) => setComposition(e.target.value)} className="w-full appearance-none bg-slate-800/30 p-4 rounded-xl outline-none text-xs border border-slate-800 focus:border-cyan-500 font-bold transition-all pr-10 cursor-pointer">
                  <option>Employee Only</option>
                  <option>Employee + Spouse</option>
                  <option>Employee + Spouse + Child</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* PANEL 3: Build */}
        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-4 flex flex-col gap-6 min-h-fit">
          <div className="flex-1 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between border-slate-700/30 shadow-2xl">
            <div className="text-center">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center justify-center gap-3"><Hash size={16} /> Batch</h2>
              <div className="p-6 bg-slate-950/40 rounded-[2rem] border border-slate-800 shadow-inner">
                <div className="text-6xl font-black text-white mb-1 leading-none">{numFiles}</div>
                <div className="text-[9px] text-slate-500 uppercase font-black tracking-[0.4em] mb-6">Files</div>
                <div className="flex justify-center gap-6">
                  <button onClick={() => setNumFiles(Math.max(1, numFiles - 1))} className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white border border-slate-700 hover:border-white transition-all shadow-lg active:scale-90"><Minus size={20} /></button>
                  <button onClick={() => setNumFiles(numFiles + 1)} className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white border border-slate-700 hover:border-white transition-all shadow-lg active:scale-90"><Plus size={20} /></button>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex justify-between items-center px-4">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Total Active Rows</span>
                <span className="text-3xl font-black text-white italic">{(productMode === 'Both' ? ichraCount + shopCount : (productMode === 'ICHRA' ? ichraCount : shopCount)) * (composition === 'Employee Only' ? 1 : composition === 'Employee + Spouse' ? 2 : 3)}</span>
              </div>
              <motion.button
                whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                onClick={generateCensus}
                disabled={isGenerating}
                className={`w-full p-6 rounded-[2rem] text-slate-950 font-black tracking-[0.2em] text-lg shadow-2xl flex items-center justify-center gap-4 uppercase transition-all 
                  ${isGenerating ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-950 hover:bg-slate-100'}`}
              >
                {isGenerating ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 size={24} strokeWidth={3} />
                    </motion.div>
                    BUILDING...
                  </>
                ) : (
                  <>
                    <Download size={24} strokeWidth={3} /> EXECUTE
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer: Preserved visibility with reduced margin */}
      <footer className="mt-8 py-6 border-t border-slate-800/30 flex justify-between items-center px-4 text-[9px] text-slate-500 uppercase tracking-[0.4em] z-10">
        <div>&copy; 2026 CENSUS.TURBO // LITE_V1</div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>Secure Link</span>
        </div>
      </footer>
    </div>
  );
}