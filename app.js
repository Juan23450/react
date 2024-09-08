import React, { useState, useEffect, useRef } from 'react';

const VerticalSlider = ({ value, onChange, max }) => {
  return (
    <div className="h-full flex items-center mr-4">
      <input
        type="range"
        min="1"
        max={max}
        value={value}
        onChange={onChange}
        className="h-[80vh] -rotate-180"
        style={{
          writingMode: 'bt-lr',
          appearance: 'slider-vertical',
        }}
      />
    </div>
  );
};

const NumberPattern = ({ number, onPatternChange, isStatic, conflictColumns }) => {
  const [baseValue, setBaseValue] = useState(0);
  const [periodicInterval, setPeriodicInterval] = useState(1);
  const [instances, setInstances] = useState(10);
  const [patternShift, setPatternShift] = useState(0);

  const generatePattern = () => {
    let pattern = [];
    let currentPos = patternShift;
    
    for (let n = 0; n < instances; n++) {
      const space = baseValue * periodicInterval + (n * periodicInterval);
      currentPos += space;
      pattern.push({ value: number, instance: n, position: currentPos });
      currentPos += 1;
    }
    return pattern;
  };

  const generateGhostPositions = () => {
    let positions = [];
    for (let i = 1; i <= 5; i++) {
      positions.push(baseValue * i + i + 1);
    }
    return positions;
  };

  const pattern = generatePattern();
  const ghostPositions = generateGhostPositions();

  useEffect(() => {
    onPatternChange(number, pattern);
  }, [baseValue, periodicInterval, instances, patternShift, number, onPatternChange, pattern]); // Added 'pattern' to dependency array

  const handleFirstInstanceDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startBaseValue = baseValue;

    const handleDrag = (e) => {
      const diffX = Math.round((e.clientX - startX) / 10);
      const newBaseValue = Math.max(0, startBaseValue + diffX);
      setBaseValue(newBaseValue);
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleSecondInstanceDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startPos = pattern[1].position;

    const handleDrag = (e) => {
      const diffX = Math.round((e.clientX - startX) / 10);
      const newPos = startPos + diffX;

      const closestGhostPos = ghostPositions.reduce((prev, curr) => 
        Math.abs(curr - newPos) < Math.abs(prev - newPos) ? curr : prev
      );

      if (Math.abs(closestGhostPos - newPos) < 5) {
        const newPeriodicInterval = ghostPositions.indexOf(closestGhostPos) + 1;
        setPeriodicInterval(newPeriodicInterval);
      }
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleInstanceDrag = (e, index) => {
    if (index < 2) return;
    e.preventDefault();
    const startX = e.clientX;
    const startShift = patternShift;

    const handleDrag = (e) => {
      const diff = Math.round((e.clientX - startX) / 10);
      const newShift = Math.max(-baseValue * periodicInterval, startShift + diff);
      setPatternShift(newShift);
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const resetPattern = () => {
    setBaseValue(0);
    setPeriodicInterval(1);
    setPatternShift(0);
    setInstances(10);
  };

  return (
    <div className="mb-4 flex items-center">
      <button onClick={resetPattern} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mr-2">
        Reset
      </button>
      <div className="flex-grow">
        <div className="flex items-center flex-wrap text-white mb-2">
          <span className="w-8 font-bold mr-2">{number}:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={instances}
            onChange={(e) => setInstances(parseInt(e.target.value))}
            className="w-32 h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer mr-2"
          />
          <span className="text-sm w-24">Instances: {instances}</span>
          <input
            type="range"
            min="1"
            max="5"
            value={periodicInterval}
            onChange={(e) => setPeriodicInterval(parseInt(e.target.value))}
            className="w-32 h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer mr-2"
          />
          <span className="text-sm w-36">Periodic Interval: {periodicInterval}</span>
          <span className="text-sm w-24">Base Value: {baseValue}</span>
        </div>
        <div className="h-10 relative overflow-hidden whitespace-nowrap border-b border-white">
          {ghostPositions.map((pos, index) => (
            <span
              key={`ghost-${index}`}
              className="absolute"
              style={{
                left: `${(pos + patternShift) * 10}px`,
                top: '0px',
                width: '10px',
                height: '10px',
                backgroundColor: 'rgba(255, 255, 0, 0.2)',
                border: '1px solid rgba(255, 255, 0, 0.5)',
                zIndex: 1
              }}
            />
          ))}
          {pattern.map((item, index) => (
            <React.Fragment key={index}>
              {isStatic && conflictColumns.includes(item.position) && (
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    left: `${item.position * 10}px`,
                    width: '10px',
                    backgroundColor: 'rgba(0, 255, 0, 0.4)',
                    boxShadow: '0 0 10px 5px rgba(0, 255, 0, 0.6)',
                    zIndex: 2
                  }}
                />
              )}
              <span 
                className="absolute cursor-move"
                style={{
                  left: `${item.position * 10}px`,
                  top: '0px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: isStatic && conflictColumns.includes(item.position) ? 'rgb(255, 0, 0)' : 'rgb(255, 255, 0)',
                  border: '1px solid white',
                  zIndex: 3
                }}
                onMouseDown={index === 0 ? handleFirstInstanceDrag : 
                             index === 1 ? handleSecondInstanceDrag :
                             (e) => handleInstanceDrag(e, index)}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const NumberPatternSliders = () => {
  const [rowCount, setRowCount] = useState(10);
  const [patterns, setPatterns] = useState({});
  const [isStatic, setIsStatic] = useState(false);
  const [compiledPattern, setCompiledPattern] = useState([]);
  const [conflictColumns, setConflictColumns] = useState([]);
  const maxRows = 50;
  const containerRef = useRef(null);

  const handlePatternChange = (number, pattern) => {
    setPatterns(prev => ({ ...prev, [number]: pattern }));
  };

  useEffect(() => {
    if (isStatic) {
      const visiblePatterns = Object.entries(patterns)
        .filter(([key, pattern]) => key <= rowCount && pattern.length > 0)
        .map(([_, pattern]) => pattern);

      const allPositions = visiblePatterns.flatMap(pattern => pattern.map(item => item.position));
      const positionCounts = allPositions.reduce((acc, pos) => {
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
      }, {});
      setConflictColumns(Object.keys(positionCounts).filter(pos => positionCounts[pos] > 1).map(Number));
    } else {
      setConflictColumns([]);
    }
  }, [patterns, isStatic, rowCount]);

  const compileAlgorithmically = () => {
    let compiledPattern = [];
    Object.values(patterns).forEach((rowPattern, rowIndex) => {
      if (rowIndex === 0) {
        rowPattern.forEach(item => {
          compiledPattern[item.position] = item.value;
        });
      } else {
        rowPattern.forEach((item, itemIndex) => {
          let segment = item.position;
          if (itemIndex > 0) {
            segment -= rowPattern[itemIndex - 1].position;
          }
          let j = 0;
          let currentPos = compiledPattern.length;
          while (j < segment) {
            if (!compiledPattern[currentPos]) {
              j++;
            }
            currentPos++;
          }
          compiledPattern[currentPos - 1] = item.value;
        });
      }
    });
    setCompiledPattern(compiledPattern);
  };

  const compileStatically = () => {
    if (conflictColumns.length > 0) {
      alert("Cannot compile statically due to conflicts.");
      return;
    }
    let compiledPattern = [];
    Object.values(patterns).forEach(pattern => {
      pattern.forEach(item => {
        compiledPattern[item.position] = item.value;
      });
    });
    setCompiledPattern(compiledPattern);
  };

  const generatePythonCode = () => {
    const maxPosition = Math.max(...Object.values(patterns).flatMap(pattern => pattern.map(item => item.position)));
    let pythonList = new Array(maxPosition + 1).fill(null);
    Object.values(patterns).forEach(pattern => {
      pattern.forEach(item => {
        pythonList[item.position] = item.value;
      });
    });
    const code = `pattern = [${pythonList.map(item => item === null ? 'None' : item).join(', ')}]`;
    navigator.clipboard.writeText(code).then(() => {
      alert("Python code copied to clipboard!");
    });
  };

  const generateCSV = () => {
    const csv = compiledPattern.map(item => item === undefined ? '' : item).join(',');
    navigator.clipboard.writeText(csv).then(() => {
      alert("CSV copied to clipboard!");
    });
  };

  return (
    <div className="p-4 bg-black text-white flex h-screen">
      <VerticalSlider 
        value={rowCount}
        onChange={(e) => setRowCount(Math.min(Math.max(parseInt(e.target.value), 1), maxRows))}
        max={maxRows}
      />
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="static-checkbox">
            <input
              type="checkbox"
              checked={isStatic}
              onChange={(e) => setIsStatic(e.target.checked)}
              className="mr-2"
            />
            <label>Static</label>
          </div>
          <div>
            <label className="font-bold mr-2">Number of rows (1-{maxRows}):</label>
            <input
              type="number"
              min="1"
              max={maxRows}
              value={rowCount}
              onChange={(e) => setRowCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), maxRows))}
              className="border rounded px-2 py-1 bg-gray-800 text-white"
            />
          </div>
        </div>
        <div className="mb-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={compileAlgorithmically}>
            Compile Algorithmically
          </button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={compileStatically}>
            Compile Statically
          </button>
          <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={generatePythonCode}>
            Copy Python Code
          </button>
          <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" onClick={generateCSV}>
            Copy CSV
          </button>
        </div>
        <div className="final-product mb-4 overflow-x-auto whitespace-nowrap" style={{border: '1px solid white', minHeight: '22px'}}>
          {compiledPattern.map((item, index) => (
            <span
              key={index}
              className="inline-block text-center"
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {item !== undefined ? item : ''}
            </span>
          ))}
        </div>
        <div 
          ref={containerRef}
          className="flex-grow overflow-x-hidden overflow-y-auto"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 1) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0',
          }}
        >
          {[...Array(rowCount)].map((_, index) => (
            <NumberPattern 
              key={index + 1}
              number={index + 1}
              onPatternChange={handlePatternChange}
              isStatic={isStatic}
              conflictColumns={conflictColumns}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NumberPatternSliders;
