import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Users, Zap, ShieldCheck, Hash,
  ChevronDown, Plus, Minus, Loader2, Sliders, Trash2, PlusCircle, Check, X
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { classesData } from './data';

// 3D Geometric Mesh Crystal Network SVG Logo Component
const LogoIcon = ({ className = "w-10 h-10" }) => (
  <img src="/logo.svg" alt="Census Turbo Logo" className={className} />
);

export default function App() {
  // Standard Mode States
  const [productMode, setProductMode] = useState('Both'); // 'ICHRA' | 'Small Group' | 'Both'
  const [censusType, setCensusType] = useState('Census'); // 'Census' | 'Quotes'
  const [composition, setComposition] = useState('Employee + Spouse');
  const [isCompositionOpen, setIsCompositionOpen] = useState(false);
  const [isCompositionOpenUpward, setIsCompositionOpenUpward] = useState(false);
  const [compositionMenuMaxHeight, setCompositionMenuMaxHeight] = useState(220);
  const [ichraCount, setIchraCount] = useState(5);
  const [shopCount, setShopCount] = useState(5);
  const [numFiles, setNumFiles] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const compositionRef = useRef(null);

  // Advanced Mode States
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [includeSpouse, setIncludeSpouse] = useState(true);
  const [childrenCount, setChildrenCount] = useState(1);

  // Custom Classes state pre-populated with predefined classes
  const [advancedClasses, setAdvancedClasses] = useState([
    { id: 8509, name: "I Full Time Salaried", productLineCd: "ICHRA", userCount: 10 },
    { id: 8510, name: "I Full Time Hourly", productLineCd: "ICHRA", userCount: 10 },
    { id: 8511, name: "I Part Time Salaried", productLineCd: "ICHRA", userCount: 10 },
    { id: 8512, name: "I Part Time Hourly", productLineCd: "ICHRA", userCount: 10 },
    { id: 8513, name: "SG No Contribution", productLineCd: "SHOP", userCount: 5 },
  ]);

  // Form state for adding new custom class
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassProduct, setNewClassProduct] = useState('ICHRA');
  const [newClassCount, setNewClassCount] = useState(5);

  const compositionOptions = ['Employee Only', 'Employee + Spouse', 'Employee + Spouse + Child'];

  // Handle outside click & escape key for dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (compositionRef.current && !compositionRef.current.contains(event.target)) {
        setIsCompositionOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsCompositionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Update composition dropdown positioning
  useEffect(() => {
    if (!isCompositionOpen) return;

    const updateCompositionMenuPosition = () => {
      if (!compositionRef.current) return;

      const rect = compositionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const estimatedMenuHeight = Math.min(compositionOptions.length * 52 + 8, 260);
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const shouldOpenUpward = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
      const availableSpace = shouldOpenUpward ? spaceAbove : spaceBelow;

      setIsCompositionOpenUpward(shouldOpenUpward);
      setCompositionMenuMaxHeight(Math.max(120, Math.floor(availableSpace - 16)));
    };

    updateCompositionMenuPosition();

    window.addEventListener('resize', updateCompositionMenuPosition);
    window.addEventListener('scroll', updateCompositionMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateCompositionMenuPosition);
      window.removeEventListener('scroll', updateCompositionMenuPosition, true);
    };
  }, [isCompositionOpen, compositionOptions.length]);

  // Filter active advanced classes based on standard Product Mode (ICHRA, Small Group, or Both)
  const activeAdvancedClasses = advancedClasses.filter((c) => {
    if (productMode === 'ICHRA') return c.productLineCd === 'ICHRA';
    if (productMode === 'Small Group') return c.productLineCd === 'SHOP';
    return true;
  });

  const advancedTotalEEs = activeAdvancedClasses.reduce(
    (sum, c) => sum + (Number(c.userCount) || 0),
    0
  );

  const advancedMembersPerEE = 1 + (includeSpouse ? 1 : 0) + (Number(childrenCount) || 0);

  const totalActiveRows = isAdvancedMode
    ? advancedTotalEEs * advancedMembersPerEE
    : (productMode === 'Both'
      ? (Number(ichraCount) || 0) + (Number(shopCount) || 0)
      : productMode === 'ICHRA'
        ? (Number(ichraCount) || 0)
        : (Number(shopCount) || 0)) *
    (composition === 'Employee Only'
      ? 1
      : composition === 'Employee + Spouse'
        ? 2
        : 3);

  // Advanced Class operations
  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const newClass = {
      id: Date.now(),
      name: newClassName.trim(),
      productLineCd: newClassProduct,
      userCount: Math.max(1, parseInt(newClassCount) || 1),
    };
    setAdvancedClasses([...advancedClasses, newClass]);
    setNewClassName('');
    setNewClassCount(5);
    setIsAddingClass(false);
  };

  const handleRemoveClass = (id) => {
    setAdvancedClasses(advancedClasses.filter((c) => c.id !== id));
  };

  const handleSetClassUserCount = (id, val) => {
    setAdvancedClasses(
      advancedClasses.map((c) => {
        if (c.id === id) {
          return { ...c, userCount: val };
        }
        return c;
      })
    );
  };

  const handleUpdateClassUserCount = (id, delta) => {
    setAdvancedClasses(
      advancedClasses.map((c) => {
        if (c.id === id) {
          const currentCount = Number(c.userCount) || 0;
          const newCount = Math.max(0, currentCount + delta);
          return { ...c, userCount: newCount };
        }
        return c;
      })
    );
  };

  const generateSSN = () => {
    let area = Math.floor(Math.random() * 199) + 500;
    if (area === 666) area++;
    return `${area}-${Math.floor(Math.random() * 89) + 11}-${Math.floor(Math.random() * 8999) + 1001}`;
  };

  const getRandomDate = (startYear, endYear) => {
    const year = Math.floor(Math.random() * (endYear - startYear)) + startYear;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return { str: `${month}/${day}/${year}`, year };
  };

  const getRandomDateByAge = (minAge, maxAge, currentYear = new Date().getFullYear()) => {
    const safeMinAge = Math.max(0, minAge);
    const safeMaxAge = Math.max(safeMinAge, maxAge);
    const startYear = currentYear - safeMaxAge;
    const endYearExclusive = currentYear - safeMinAge + 1;
    return getRandomDate(startYear, endYearExclusive);
  };

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const generateCensus = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const currentYear = new Date().getFullYear();
    const maleFirstNames = ['James', 'Robert', 'John', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'];
    const femaleFirstNames = ['Mary', 'Patricia', 'Jennifer', 'Ella', 'Elizabeth', 'Kate', 'Susan', 'Jessica', 'Sarah', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    try {
      for (let f = 1; f <= (Number(numFiles) || 1); f++) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Census_Data');
        const isQuote = censusType === 'Quotes';

        sheet.addRow([]);

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
          { key: 'mHome', width: 25 }, { key: 'paper', width: 25 }, { key: 'cStart', width: 25 }, { key: 'cPrem', width: 25 },
          { key: 'rPrem', width: 25 }
        ];

        sheet.columns = colDefs;

        const headers = isQuote
          ? ['', 'EE ID', 'Last Name', 'First Name', 'Member Type', 'Zip Code', 'DOB', 'Annual Household Income', 'Contribution Name', 'Current Group Plan Premium', 'Renewal Group Plan Premium']
          : [
            '', 'EE ID', 'Last Name', 'First Name', 'Email', 'Member Type', 'SSN',
            'Date of Birth', 'Age', 'Gender', 'Disabled', 'Date of Hire',
            'Annual Household Income', 'Contribution Name', 'Address Line 1', 'Apt/Floor # Line 2', 'City',
            'Zip Code', 'State', 'Mailing Same as Home (yes/no)',
            'Paperless (yes/no)', 'Contribution Start Date', 'Current Group Plan Premium', 'Renewal Group Plan Premium'
          ];

        const headerRow = sheet.getRow(2);
        headerRow.values = headers;
        headerRow.font = { bold: true, size: 12 };

        if (isAdvancedMode) {
          // --- ADVANCED MODE GENERATION ---
          const currentClasses = advancedClasses.filter((c) => {
            if (productMode === 'ICHRA') return c.productLineCd === 'ICHRA';
            if (productMode === 'Small Group') return c.productLineCd === 'SHOP';
            return true;
          });

          const tiers = [
            'Employee',
            ...(includeSpouse ? ['Spouse'] : []),
            ...Array.from({ length: childrenCount }, () => 'Child')
          ];

          currentClasses.forEach((cls) => {
            for (let u = 0; u < (Number(cls.userCount) || 0); u++) {
              const eeId = Math.floor(Math.random() * 89999) + 10000;
              const sharedLastName = getRandom(lastNames);
              const householdUsedNames = new Set();
              const pickUniqueHouseholdName = (gender) => {
                const namesList = gender === 'M' ? maleFirstNames : femaleFirstNames;
                const availableNames = namesList.filter((name) => !householdUsedNames.has(name));
                const selectedName = availableNames.length > 0
                  ? getRandom(availableNames)
                  : `${getRandom(namesList)}${Math.floor(Math.random() * 90) + 10}`;
                householdUsedNames.add(selectedName);
                return selectedName;
              };

              const minimumEmployeeAge = tiers.includes('Child') ? 28 : 21;
              const employeeDob = getRandomDateByAge(minimumEmployeeAge, 64, currentYear);
              const employeeAge = currentYear - employeeDob.year;
              const employeeGender = getRandom(['M', 'F']);

              tiers.forEach((tier, tIdx) => {
                const isEE = tier === 'Employee';
                let dobObj = employeeDob;
                if (tier === 'Spouse') {
                  dobObj = getRandomDateByAge(18, Math.max(18, employeeAge - 1), currentYear);
                }
                if (tier === 'Child') {
                  const maxChildAge = Math.min(26, Math.max(0, employeeAge - 16));
                  dobObj = getRandomDateByAge(1, maxChildAge, currentYear);
                }

                let memberGender = employeeGender;
                if (tier === 'Spouse') {
                  memberGender = employeeGender === 'M' ? 'F' : 'M';
                }
                if (tier === 'Child') {
                  memberGender = getRandom(['M', 'F']);
                }

                const fn = pickUniqueHouseholdName(memberGender);
                const memberAge = currentYear - dobObj.year;

                sheet.addRow({
                  buffer: '', id: eeId, ln: sharedLastName, fn: fn,
                  email: `${fn.toLowerCase()}.${sharedLastName.toLowerCase()}${eeId}${tIdx}@yopmail.com`,
                  mType: tier, ssn: generateSSN(), dob: dobObj.str, age: memberAge,
                  zip: '06106', income: isEE ? (Math.floor(Math.random() * 50000) + 30000).toFixed(2) : '',
                  className: isEE ? cls.name : '', gender: memberGender, dis: 'N',
                  doh: isEE ? '01/15/2024' : '', a1: '1 Main St', a2: '', city: 'Hartford', state: 'Connecticut',
                  mHome: 'yes', paper: 'no', cStart: '',
                  cPrem: isEE ? (Math.floor(Math.random() * 5000) + 1000).toFixed(2) : '',
                  rPrem: isEE ? (Math.floor(Math.random() * 5000) + 1100).toFixed(2) : ''
                });
              });
            }
          });
        } else {
          // --- STANDARD MODE GENERATION ---
          const employeePool = [];
          if (productMode === 'ICHRA' || productMode === 'Both') for (let i = 0; i < (Number(ichraCount) || 0); i++) employeePool.push('ICHRA');
          if (productMode === 'Small Group' || productMode === 'Both') for (let i = 0; i < (Number(shopCount) || 0); i++) employeePool.push('SHOP');

          employeePool.forEach((prodType) => {
            const eeId = Math.floor(Math.random() * 89999) + 10000;
            const sharedLastName = getRandom(lastNames);
            const randomClass = getRandom(classesData.filter(c => c.productLineCd === prodType));
            const householdUsedNames = new Set();
            const pickUniqueHouseholdName = (gender) => {
              const namesList = gender === 'M' ? maleFirstNames : femaleFirstNames;
              const availableNames = namesList.filter((name) => !householdUsedNames.has(name));
              const selectedName = availableNames.length > 0
                ? getRandom(availableNames)
                : `${getRandom(namesList)}${Math.floor(Math.random() * 90) + 10}`;
              householdUsedNames.add(selectedName);
              return selectedName;
            };

            const tiers = composition === 'Employee Only' ? ['Employee'] :
              composition === 'Employee + Spouse' ? ['Employee', 'Spouse'] :
                ['Employee', 'Spouse', 'Child'];
            const minimumEmployeeAge = tiers.includes('Child') ? 28 : 21;
            const employeeDob = getRandomDateByAge(minimumEmployeeAge, 64, currentYear);
            const employeeAge = currentYear - employeeDob.year;
            const employeeGender = getRandom(['M', 'F']);

            tiers.forEach((tier, tIdx) => {
              const isEE = tier === 'Employee';
              let dobObj = employeeDob;
              if (tier === 'Spouse') {
                dobObj = getRandomDateByAge(18, Math.max(18, employeeAge - 1), currentYear);
              }
              if (tier === 'Child') {
                const maxChildAge = Math.min(26, Math.max(0, employeeAge - 16));
                dobObj = getRandomDateByAge(12, maxChildAge, currentYear);
              }

              let memberGender = employeeGender;
              if (tier === 'Spouse') {
                memberGender = employeeGender === 'M' ? 'F' : 'M';
              }
              if (tier === 'Child') {
                memberGender = getRandom(['M', 'F']);
              }

              const fn = pickUniqueHouseholdName(memberGender);

              const memberAge = currentYear - dobObj.year;
              sheet.addRow({
                buffer: '', id: eeId, ln: sharedLastName, fn: fn,
                email: `${fn.toLowerCase()}.${sharedLastName.toLowerCase()}${eeId}${tIdx}@yopmail.com`,
                mType: tier, ssn: generateSSN(), dob: dobObj.str, age: memberAge,
                zip: '06106', income: isEE ? (Math.floor(Math.random() * 50000) + 30000).toFixed(2) : '',
                className: isEE ? randomClass.name : '', gender: memberGender, dis: 'N',
                doh: isEE ? '01/15/2024' : '', a1: '1 Main St', a2: '', city: 'Hartford', state: 'Connecticut',
                mHome: 'yes', paper: 'no', cStart: '',
                cPrem: isEE ? (Math.floor(Math.random() * 5000) + 1000).toFixed(2) : '',
                rPrem: isEE ? (Math.floor(Math.random() * 5000) + 1100).toFixed(2) : ''
              });
            });
          });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        const fileTypeLabel = isQuote ? 'Quotes' : 'Census';
        a.download = `${productMode}_${fileTypeLabel}_${f}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-200 flex flex-col p-4 md:px-8 md:py-4 relative overflow-y-auto">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.03),transparent_70%)]" />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-4 w-full px-2 gap-4 z-10">
        <div className="flex items-center gap-3.5 cursor-pointer">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex items-center justify-center cursor-pointer"
          >
            <LogoIcon className="w-10 h-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
          </motion.div>
          <motion.h1
            animate={{ filter: ["drop-shadow(0 0 2px #a855f7)", "drop-shadow(0 0 8px #a855f7)", "drop-shadow(0 0 2px #a855f7)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-2xl font-black text-white uppercase tracking-tighter italic"
          >
            CENSUS<span className="text-purple-400">TURBO</span>
          </motion.h1>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setIsAdvancedMode(false)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${!isAdvancedMode
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Zap size={14} /> STANDARD
            </button>
            <button
              onClick={() => setIsAdvancedMode(true)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${isAdvancedMode
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-black shadow-lg border border-white/20'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Sliders size={14} /> ADVANCED MODE
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-green-500" />
            {isAdvancedMode ? 'ADVANCED' : 'SYSTEM READY'}
          </div>
        </div>
      </header>
      {/* Main Layout Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 w-full z-10">
        {/* PANEL 1: Mode, Output Format & Batch Files */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-4 glass-card rounded-[2.5rem] p-6 flex flex-col justify-between shadow-2xl min-h-fit gap-4"
        >


          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <Zap size={16} /> Mode & Configuration
              </h2>
              {isAdvancedMode && (
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ADVANCED ACTIVE
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setProductMode('ICHRA')}
              className={`py-3.5 rounded-2xl text-xs font-black transition-all border cursor-pointer ${productMode === 'ICHRA'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:border-cyan-500'
                }`}
            >
              ICHRA ONLY
            </button>
            <button
              type="button"
              onClick={() => setProductMode('Small Group')}
              className={`py-3.5 rounded-2xl text-xs font-black transition-all border cursor-pointer ${productMode === 'Small Group'
                ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:border-purple-500'
                }`}
            >
              SMALL GROUP ONLY
            </button>
            <button
              type="button"
              onClick={() => setProductMode('Both')}
              className={`py-3.5 rounded-2xl text-xs font-black transition-all border cursor-pointer ${productMode === 'Both'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-white/20 shadow-xl'
                : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
            >
              HYBRID BOTH
            </button>
          </div>

          {/* Format Toggle */}
          <div className="pt-2 border-t border-slate-800/40">
            <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 ml-1">Format</h2>
            <div className="flex gap-2">
              {['Census', 'Quotes'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCensusType(t)}
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border cursor-pointer ${censusType === t
                    ? 'bg-slate-100 text-slate-900 border-white font-bold shadow-md'
                    : 'bg-slate-800/40 text-slate-500 border-slate-700 hover:text-slate-300'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Batch Files (Shown in Card 1 during Advanced Mode) */}
          {isAdvancedMode && (
            <div className="pt-2 border-t border-slate-800/40">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1.5">
                  <Hash size={13} /> Batch Files
                </span>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 shadow-inner flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Count:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={numFiles}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setNumFiles('');
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) {
                          setNumFiles(Math.max(1, parsed));
                        }
                      }
                    }}
                    onBlur={() => {
                      if (numFiles === '' || isNaN(Number(numFiles))) {
                        setNumFiles(1);
                      } else {
                        setNumFiles(Math.max(1, parseInt(numFiles, 10)));
                      }
                    }}
                    className="w-12 text-center text-xl font-black text-white bg-slate-900 rounded-lg py-1 border border-slate-700 outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNumFiles(Math.max(1, (Number(numFiles) || 1) - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white border border-slate-700 hover:border-white transition-all shadow-md active:scale-90 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNumFiles((Number(numFiles) || 1) + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white border border-slate-700 hover:border-white transition-all shadow-lg active:scale-90 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* PANEL 2: Standard Population OR Advanced Dependents */}
        <motion.section
          layout
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-4 glass-card rounded-[2.5rem] p-6 flex flex-col justify-between min-h-fit shadow-2xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
              <Users size={16} /> {isAdvancedMode ? 'Household Dependents' : 'Population & Composition'}
            </h2>
            {isAdvancedMode && (
              <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                HOUSEHOLD STRUCTURE
              </span>
            )}
          </div>

          {!isAdvancedMode ? (
            /* --- STANDARD MODE POPULATION & COMPOSITION --- */
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <AnimatePresence mode="popLayout">
                {(productMode === 'ICHRA' || productMode === 'Both') && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key="ichra"
                    className="p-6 bg-cyan-950/10 rounded-[2rem] border border-cyan-500/10"
                  >
                    <div className="flex justify-between items-center mb-4 text-[9px] uppercase font-black tracking-widest text-cyan-500">
                      <span>ICHRA EEs</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={ichraCount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setIchraCount('');
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setIchraCount(Math.max(0, parsed));
                            }
                          }
                        }}
                        onBlur={() => {
                          if (ichraCount === '' || isNaN(Number(ichraCount))) {
                            setIchraCount(0);
                          } else {
                            setIchraCount(Math.max(0, parseInt(ichraCount, 10)));
                          }
                        }}
                        className="w-16 text-right text-2xl font-black text-white bg-transparent outline-none border-b border-transparent focus:border-cyan-500"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Number(ichraCount) || 0}
                      onChange={(e) => setIchraCount(parseInt(e.target.value, 10))}
                      style={{ accentColor: '#06b6d4' }}
                      className="w-full h-1.5 cursor-pointer"
                    />
                  </motion.div>
                )}

                {(productMode === 'Small Group' || productMode === 'Both') && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key="shop"
                    className="p-6 bg-purple-950/10 rounded-[2rem] border border-purple-500/10"
                  >
                    <div className="flex justify-between items-center mb-4 text-[9px] uppercase font-black tracking-widest text-purple-500">
                      <span>SHOP EEs</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={shopCount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setShopCount('');
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setShopCount(Math.max(0, parsed));
                            }
                          }
                        }}
                        onBlur={() => {
                          if (shopCount === '' || isNaN(Number(shopCount))) {
                            setShopCount(0);
                          } else {
                            setShopCount(Math.max(0, parseInt(shopCount, 10)));
                          }
                        }}
                        className="w-16 text-right text-2xl font-black text-white bg-transparent outline-none border-b border-transparent focus:border-purple-500"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Number(shopCount) || 0}
                      onChange={(e) => setShopCount(parseInt(e.target.value, 10))}
                      style={{ accentColor: '#a855f7' }}
                      className="w-full h-1.5 cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-6 mt-auto">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-3 ml-1">
                  Composition
                </label>
                <div ref={compositionRef} className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsCompositionOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isCompositionOpen}
                    className="w-full bg-slate-800/30 p-4 rounded-xl outline-none text-sm border border-slate-700 focus:border-cyan-500 font-semibold transition-all pr-10 cursor-pointer text-slate-100 text-left hover:border-slate-500"
                  >
                    {composition}
                  </button>
                  <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${isCompositionOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'}`} size={18} />

                  <AnimatePresence>
                    {isCompositionOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: isCompositionOpenUpward ? 6 : -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: isCompositionOpenUpward ? 6 : -6 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        style={{ maxHeight: compositionMenuMaxHeight }}
                        className={`absolute z-30 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-2xl ${isCompositionOpenUpward ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                      >
                        <ul role="listbox" className="py-1">
                          {compositionOptions.map((option) => {
                            const isSelected = composition === option;
                            return (
                              <li key={option}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setComposition(option);
                                    setIsCompositionOpen(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors cursor-pointer ${isSelected ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-100 hover:bg-slate-800 hover:text-white'}`}
                                >
                                  {option}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ) : (
            /* --- ADVANCED MODE DEPENDENTS & CLASS CREATION --- */
            <div className="space-y-3 flex-1 flex flex-col justify-start">
              {/* 1. Household Dependents */}
              <div className="p-4 bg-slate-900/40 rounded-[1.2rem] border border-slate-800 space-y-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex justify-between items-center">
                  <span>Dependents per Household</span>
                  <span className="text-xs text-cyan-400 font-bold">
                    {advancedMembersPerEE} members / EE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Spouse Toggle */}
                  <div className="flex flex-col gap-1 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[8px] uppercase font-black text-slate-400">Spouse</span>
                    <button
                      type="button"
                      onClick={() => setIncludeSpouse(!includeSpouse)}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center justify-between ${includeSpouse
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800/40 text-slate-500 border-slate-700'
                        }`}
                    >
                      <span>{includeSpouse ? 'Included (+1)' : 'None (0)'}</span>
                      {includeSpouse && <Check size={12} className="text-cyan-400" />}
                    </button>
                  </div>

                  {/* Children Counter */}
                  <div className="flex flex-col gap-1 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[8px] uppercase font-black text-slate-400">Children Count</span>
                    <div className="flex items-center justify-between bg-slate-950 rounded-lg p-1 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setChildrenCount(Math.max(0, (Number(childrenCount) || 0) - 1))}
                        className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={childrenCount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setChildrenCount('');
                          } else {
                            const parsed = parseInt(val, 10);
                            if (!isNaN(parsed)) {
                              setChildrenCount(parsed);
                            }
                          }
                        }}
                        onBlur={() => {
                          if (childrenCount === '' || isNaN(Number(childrenCount))) {
                            setChildrenCount(0);
                          } else {
                            setChildrenCount(Math.max(0, parseInt(childrenCount, 10)));
                          }
                        }}
                        className="w-10 text-center text-xs font-black text-white bg-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setChildrenCount((Number(childrenCount) || 0) + 1)}
                        className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Formula Badge */}
                <div className="text-[9px] bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-slate-300 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Structure: 1 Employee {includeSpouse ? '+ 1 Spouse ' : ''}{(Number(childrenCount) || 0) > 0 ? `+ ${Number(childrenCount) || 0} Child${(Number(childrenCount) || 0) > 1 ? 'ren' : ''}` : ''}
                </div>
              </div>

              {/* Add Class Button & Drawer in Card 2 */}
              <div className="pt-2 border-t border-slate-800/40 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsAddingClass(!isAddingClass)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-black text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-2 cursor-pointer bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition-all shadow-md"
                >
                  <PlusCircle size={14} /> {isAddingClass ? 'Close Class Form' : 'Add New Class'}
                </button>

                {/* Add Class Form Drawer */}
                <AnimatePresence>
                  {isAddingClass && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.12, ease: 'easeInOut' }}
                      onSubmit={handleAddClass}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2 overflow-hidden shadow-xl"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-wider text-purple-400">
                          New Custom Class
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingClass(false)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Class Name (e.g. Executive Full Time)"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="w-full bg-slate-950 p-2 rounded-lg text-xs border border-slate-800 outline-none focus:border-cyan-500 text-slate-100"
                        required
                      />

                      <div className="flex gap-2">
                        <div className="flex-1 flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                          <button
                            type="button"
                            onClick={() => setNewClassProduct('ICHRA')}
                            className={`flex-1 py-1 text-[9px] font-black rounded cursor-pointer ${newClassProduct === 'ICHRA'
                              ? 'bg-cyan-500 text-slate-950'
                              : 'text-slate-400'
                              }`}
                          >
                            ICHRA
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewClassProduct('SHOP')}
                            className={`flex-1 py-1 text-[9px] font-black rounded cursor-pointer ${newClassProduct === 'SHOP'
                              ? 'bg-purple-500 text-white'
                              : 'text-slate-400'
                              }`}
                          >
                            SHOP
                          </button>
                        </div>

                        <div className="w-20 flex items-center bg-slate-950 px-2 rounded-lg border border-slate-800">
                          <span className="text-[8px] font-bold text-slate-400 mr-1">EEs:</span>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={newClassCount}
                            onChange={(e) => setNewClassCount(e.target.value)}
                            className="w-full bg-transparent text-xs font-bold outline-none text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-black rounded-lg cursor-pointer shadow-md"
                      >
                        SAVE CLASS
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.section>

        {/* PANEL 3: Standard Build Execution OR Advanced Classes Composition */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-4 flex flex-col gap-6 min-h-fit"
        >
          <div className="flex-1 glass-card rounded-[2.5rem] p-6 flex flex-col justify-between shadow-2xl">
            {!isAdvancedMode ? (
              /* --- STANDARD MODE BUILD EXECUTION --- */
              <div className="flex-1 flex flex-col justify-between">
                <div className="text-center">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center justify-center gap-3">
                    <Hash size={16} /> Batch
                  </h2>
                  <div className="p-6 bg-slate-950/40 rounded-[2rem] border border-slate-800 shadow-inner">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={numFiles}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setNumFiles('');
                        } else {
                          const parsed = parseInt(val, 10);
                          if (!isNaN(parsed)) {
                            setNumFiles(Math.max(1, parsed));
                          }
                        }
                      }}
                      onBlur={() => {
                        if (numFiles === '' || isNaN(Number(numFiles))) {
                          setNumFiles(1);
                        } else {
                          setNumFiles(Math.max(1, parseInt(numFiles, 10)));
                        }
                      }}
                      className="w-full text-center text-6xl font-black text-white mb-1 leading-none bg-transparent outline-none border-b border-transparent focus:border-cyan-500"
                    />
                    <div className="text-[9px] text-slate-500 uppercase font-black tracking-[0.4em] mb-6">Files</div>
                    <div className="flex justify-center gap-6">
                      <button
                        type="button"
                        onClick={() => setNumFiles(Math.max(1, (Number(numFiles) || 1) - 1))}
                        className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white border border-slate-700 hover:border-white transition-all shadow-lg active:scale-90 cursor-pointer"
                      >
                        <Minus size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setNumFiles((Number(numFiles) || 1) + 1)}
                        className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white border border-slate-700 hover:border-white transition-all shadow-lg active:scale-90 cursor-pointer"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                      Total Active Rows
                    </span>
                    <span className="text-3xl font-black text-white italic">
                      {totalActiveRows}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                    whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                    onClick={generateCensus}
                    disabled={isGenerating || totalActiveRows === 0}
                    className={`w-full p-6 rounded-[2rem] text-slate-950 font-black tracking-[0.2em] text-lg shadow-2xl flex items-center justify-center gap-4 uppercase transition-all cursor-pointer ${isGenerating || totalActiveRows === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-white text-slate-950 hover:bg-slate-100'
                      }`}
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
            ) : (
              /* --- ADVANCED MODE CLASSES COMPOSITION --- */
              <div className="flex-1 flex flex-col justify-between space-y-4">


                {/* Class list container with full room in Card 3 */}
                <div className={`overflow-y-auto space-y-1.5 pr-1 max-h-[360px]`}>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Sliders size={15} /> Classes & EE Allocation
                    </h2>
                  </div>
                  {activeAdvancedClasses.length === 0 ? (
                    <div className="p-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      No classes configured for current mode. Click "+ Add Class" above.
                    </div>
                  ) : (
                    activeAdvancedClasses.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[8px] font-black px-1.5 py-0.5 rounded ${c.productLineCd === 'ICHRA'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                }`}
                            >
                              {c.productLineCd}
                            </span>
                            <span className="text-xs font-bold text-slate-200 truncate">
                              {c.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleUpdateClassUserCount(c.id, -1)}
                              className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700 cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={c.userCount}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  handleSetClassUserCount(c.id, '');
                                } else {
                                  const parsed = parseInt(val, 10);
                                  if (!isNaN(parsed)) {
                                    handleSetClassUserCount(c.id, Math.max(0, parsed));
                                  }
                                }
                              }}
                              onBlur={() => {
                                if (c.userCount === '' || isNaN(Number(c.userCount))) {
                                  handleSetClassUserCount(c.id, 0);
                                } else {
                                  handleSetClassUserCount(c.id, Math.max(0, parseInt(c.userCount, 10)));
                                }
                              }}
                              className="w-10 text-center text-xs font-black text-white bg-transparent outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateClassUserCount(c.id, 1)}
                              className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveClass(c.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                            title="Remove class"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-3 border-t border-slate-800/40 space-y-3">
                  <div className="flex justify-between items-center px-3 py-2 bg-slate-950/40 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">
                      Total Active Rows
                    </span>
                    <span className="text-2xl font-black text-white italic">
                      {totalActiveRows}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                    whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                    onClick={generateCensus}
                    disabled={isGenerating || totalActiveRows === 0}
                    className={`w-full py-3.5 rounded-2xl text-slate-950 font-black tracking-[0.2em] text-base shadow-2xl flex items-center justify-center gap-3 uppercase transition-all cursor-pointer ${isGenerating || totalActiveRows === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-white text-slate-950 hover:bg-slate-100'
                      }`}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Loader2 size={20} strokeWidth={3} />
                        </motion.div>
                        BUILDING...
                      </>
                    ) : (
                      <>
                        <Download size={20} strokeWidth={3} /> EXECUTE
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="mt-4 py-3 border-t border-slate-800/30 flex justify-between items-center px-4 text-[9px] text-slate-500 uppercase tracking-[0.4em] z-10">
        <div>&copy; 2026 CENSUS.TURBO</div>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span>Secure Link</span>
        </div>
      </footer>
    </div>
  );
}