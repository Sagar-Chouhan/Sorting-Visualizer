let isPaused = false;
let comparisons = 0;
let swaps = 0;

let data = [];
let sortedHighlight = false;
let ctx = document.getElementById("canvas").getContext("2d");
let stopRequested = false;
let stoppedManually = false;
const complexityMap = {
  "Bubble Sort": {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
  },
  "Selection Sort": {
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
  },
  "Insertion Sort": {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
  },
  "Merge Sort": {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
  },
  "Quick Sort": {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
  },
  "Heap Sort": {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
  },
};

function stopSorting() {
  stopRequested = true;
  stoppedManually = true;
  setStatus("Sorting stopped by user.");
  document.getElementById("stats").innerText = ""; // optional: clear stats too
  toggleButtons(false); // ✅ re-enable buttons after stop
}

async function startSorting() {
  toggleButtons(true); // disable buttons while sorting
  document.getElementById("stats").innerText = "";
  const algorithm = document.getElementById("algorithm").value;
  const speed = parseInt(document.getElementById("speedRange").value); // ✅ dynamic speed

  const mode = document.getElementById("sortMode").value;

  stopRequested = false; // ✅ Reset stop flag
  stoppedManually = false; // reset both flags

  comparisons = 0;
  swaps = 0;
  updateCounters();

  if (data.length === 0) {
    setStatus("Please set or generate an array first.");
    toggleButtons(false); // ✅ Re-enable buttons
    return;
  }

  if (algorithm === "Compare All") {
    setStatus("Comparing all algorithms...");

    const original = [...data]; // 🔥 store the unsorted original array

    const algorithms = [
      { name: "Bubble Sort", func: (s) => bubbleSort(mode, s) },
      { name: "Selection Sort", func: (s) => selectionSort(mode, s) },
      { name: "Insertion Sort", func: (s) => insertionSort(mode, s) },
      {
        name: "Merge Sort",
        func: (s) => mergeSort(0, data.length - 1, mode, s),
      },
      {
        name: "Quick Sort",
        func: (s) => quickSort(0, data.length - 1, mode, s),
      },
      { name: "Heap Sort", func: (s) => heapSort(mode, s) },
    ];

    let results = [];

    for (let algo of algorithms) {
      if (stopRequested) {
        stoppedManually = true;
        return;
      }
      comparisons = 0;
      swaps = 0;
      updateCounters();
      data = [...original]; // 🧠 reset to original unsorted array

      setStatus(`Running ${algo.name}...`); // 🟢 Show current algorithm

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawAlgorithmName(algo.name); // 👈 Draw label

      drawData(); // show the fresh unsorted state
      await sleep(500); // visual pause before each sort

      const start = performance.now();
      await algo.func(getSpeed);
      const end = performance.now();

      // results.push(`${algo.name}: ${comparisons} cmp, ${swaps} swp, ${(end - start).toFixed(2)} ms`);
      const caseType = analyzeCase(original, algo.name);
      const complexity = complexityMap[algo.name][caseType.toLowerCase()];

      results.push({
        name: algo.name,
        comparisons: comparisons,
        swaps: swaps,
        time: end - start,
        caseType: caseType,
        complexity: complexity,
      });
    }

    data = [...original].sort((a, b) => (mode === "asc" ? a - b : b - a)); // final sorted display
    drawData();
    setStatus("Comparison complete!");
    // document.getElementById('stats').innerText = results.join(' | ');
    let tableHTML = `
<table class="table table-bordered table-hover table-striped table-sm mt-3 shadow-sm rounded text-center align-middle">
  <thead class="table-primary">
    <tr>
      <th scope="col">📊 Algorithm</th>
      <th scope="col">🔍 Comparisons</th>
      <th scope="col">🔁 Swaps</th>
      <th scope="col">⏱️ Time (ms)</th>
      <th scope="col">📈 Case</th>
      <th scope="col">🧠 Time Complexity</th>
    </tr>
  </thead>
  <tbody>
`;

    for (let res of results) {
      const c = complexityMap[res.name];
      const inputCase = analyzeCase(original, res.name);

      let caseClass = "";
      let timeComplexity = "";

      if (inputCase === "Best") {
        caseClass = "text-success fw-semibold";
        timeComplexity = c.best;
      } else if (inputCase === "Worst") {
        caseClass = "text-danger fw-semibold";
        timeComplexity = c.worst;
      } else {
        caseClass = "text-warning fw-semibold";
        timeComplexity = c.average;
      }

      tableHTML += `
<tr>
<td>${res.name}</td>
<td>${res.comparisons}</td>
<td>${res.swaps}</td>
<td>${res.time.toFixed(2)}</td>
<td class="${caseClass}">${inputCase}</td>
<td>${timeComplexity}</td>
</tr>
`;
    }

    tableHTML += `</tbody></table>`;
    // document.getElementById('stats').innerHTML = tableHTML;
    const sortedArrayLine = `<div class="mt-2"><strong>Sorted array:</strong> [${[
      ...data,
    ].join(", ")}]</div>`;
    document.getElementById("stats").innerHTML = tableHTML + sortedArrayLine;

    document.getElementById("counters").innerText = ""; // clear old stats

    document.getElementById("counters").innerText = "";
    toggleButtons(false);
    return;
  }

  const startTime = performance.now();

  switch (algorithm) {
    case "Bubble Sort":
      await bubbleSort(mode, getSpeed);
      break;
    case "Selection Sort":
      await selectionSort(mode, getSpeed);
      break;
    case "Insertion Sort":
      await insertionSort(mode, getSpeed);
      break;
    case "Merge Sort":
      await mergeSort(0, data.length - 1, mode, getSpeed);
      break;
    case "Quick Sort":
      await quickSort(0, data.length - 1, mode, getSpeed);
      break;
    case "Heap Sort":
      await heapSort(mode, getSpeed);
      break;

    default:
      setStatus("Algorithm not yet implemented.");
      return;
  }
  if (stopRequested) {
    stoppedManually = true;
    return; // 🛑 Exit silently if stopped mid-way
  }

  resizeCanvas();
  drawData();
  const endTime = performance.now();
  const sortedArray = data.join(", ");
  setStatus("Sorting complete!");
  updateCounters();
  const original = document
    .getElementById("arrayInput")
    .value.split(",")
    .map(Number);
  const caseType = analyzeCase(original, algorithm);

  const complexity = complexityMap[algorithm][caseType.toLowerCase()];
  let caseClass =
    caseType === "Best"
      ? "text-success"
      : caseType === "Worst"
      ? "text-danger"
      : "text-warning";

  document.getElementById("stats").innerHTML = `
<div><strong>Sorted array:</strong> [${sortedArray}]</div>
<div><strong>Time taken:</strong> ${(endTime - startTime).toFixed(2)} ms</div>
<div><strong class="${caseClass}">Case: ${caseType} – ${complexity}</strong></div>
`;

  toggleButtons(false); // re-enable buttons after sorting or stopping
}

function drawAlgorithmName(name) {
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--text-color")
    .trim();

  ctx.font = "20px Arial";
  ctx.fillText(`Algorithm: ${name}`, 10, 30); // top-left corner
}

async function bubbleSort(mode, speed) {
  for (let i = 0; i < data.length - 1; i++) {
    for (let j = 0; j < data.length - i - 1; j++) {
      if (stopRequested) return;
      comparisons++;
      if (
        (mode === "asc" && data[j] > data[j + 1]) ||
        (mode === "desc" && data[j] < data[j + 1])
      ) {
        swaps++;
        [data[j], data[j + 1]] = [data[j + 1], data[j]];
        drawData(j, j + 1);
        updateCounters();
        await sleep(speed());
      }
    }
  }
}

async function selectionSort(mode, speed) {
  for (let i = 0; i < data.length; i++) {
    let targetIdx = i;
    for (let j = i + 1; j < data.length; j++) {
      comparisons++;
      if (
        (mode === "asc" && data[j] < data[targetIdx]) ||
        (mode === "desc" && data[j] > data[targetIdx])
      ) {
        targetIdx = j;
      }
    }
    [data[i], data[targetIdx]] = [data[targetIdx], data[i]];
    swaps++;
    updateCounters();
    drawData(i, targetIdx);
    await sleep(speed());
  }
}

async function insertionSort(mode, speed) {
  for (let i = 1; i < data.length; i++) {
    if (stopRequested) return;
    let key = data[i];
    let j = i - 1;
    while (
      j >= 0 &&
      ((mode === "asc" && data[j] > key) || (mode === "desc" && data[j] < key))
    ) {
      comparisons++;
      data[j + 1] = data[j];
      j--;
      swaps++;
      updateCounters();
      drawData(j + 1, i);
      await sleep(speed());
    }
    comparisons++;
    data[j + 1] = key;
    updateCounters();
    drawData(j + 1, i);
    await sleep(speed());
  }
}

async function mergeSort(start, end, mode, speed) {
  if (stopRequested) return;
  if (start >= end) return;
  const mid = Math.floor((start + end) / 2);
  await mergeSort(start, mid, mode, speed);
  await mergeSort(mid + 1, end, mode, speed);
  await merge(start, mid, end, mode, speed);
}

async function merge(start, mid, end, mode, speed) {
  if (stopRequested) return;
  let left = data.slice(start, mid + 1);
  let right = data.slice(mid + 1, end + 1);
  let i = 0,
    j = 0,
    k = start;

  while (i < left.length && j < right.length) {
    comparisons++;

    if (
      (mode === "asc" && left[i] <= right[j]) ||
      (mode === "desc" && left[i] >= right[j])
    ) {
      data[k++] = left[i++];
    } else {
      data[k++] = right[j++];
    }

    drawData(k - 1);
    updateCounters();
    await sleep(speed());
  }

  while (i < left.length) {
    data[k++] = left[i++];
    drawData(k - 1);
    updateCounters();
    await sleep(speed());
  }

  while (j < right.length) {
    data[k++] = right[j++];
    drawData(k - 1);
    await sleep(speed());
  }
  updateCounters();
}

async function quickSort(start, end, mode, speed) {
  if (stopRequested) return;
  if (start >= end) return;

  const pi = await partition(start, end, mode, speed);
  await quickSort(start, pi - 1, mode, speed);
  await quickSort(pi + 1, end, mode, speed);
}

async function partition(low, high, mode, speed) {
  if (stopRequested) return;

  let pivot = data[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    comparisons++;
    updateCounters();

    let condition = mode === "asc" ? data[j] < pivot : data[j] > pivot;
    if (condition) {
      i++;
      [data[i], data[j]] = [data[j], data[i]];
      swaps++;
      updateCounters();
      drawData(i, j);
      await sleep(speed());
    }
  }

  [data[i + 1], data[high]] = [data[high], data[i + 1]];
  swaps++;
  updateCounters();
  drawData(i + 1, high);
  await sleep(speed());
  return i + 1;
}

async function heapSort(mode, speed) {
  let n = data.length;

  // Build max/min heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i, mode, speed);
  }

  for (let i = n - 1; i > 0; i--) {
    [data[0], data[i]] = [data[i], data[0]];
    swaps++;
    updateCounters();
    drawData(0, i);
    await sleep(speed());

    await heapify(i, 0, mode, speed);
  }
}

async function heapify(n, i, mode, speed) {
  let largest = i;
  let left = 2 * i + 1;
  let right = 2 * i + 2;

  if (
    left < n &&
    ((mode === "asc" && data[left] > data[largest]) ||
      (mode === "desc" && data[left] < data[largest]))
  ) {
    largest = left;
  }

  if (
    right < n &&
    ((mode === "asc" && data[right] > data[largest]) ||
      (mode === "desc" && data[right] < data[largest]))
  ) {
    largest = right;
  }

  if (largest !== i) {
    [data[i], data[largest]] = [data[largest], data[i]];
    swaps++;
    updateCounters();
    drawData(i, largest);
    await sleep(speed());
    await heapify(n, largest, mode, speed);
  }
  comparisons += 2; // for left and right comparison
}

function drawData(highlight1 = -1, highlight2 = -1) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const barWidth = ctx.canvas.width / data.length;
  const maxVal = Math.max(...data);
  data.forEach((value, i) => {
    const height = (value / maxVal) * ctx.canvas.height * 0.9;
    const x = i * barWidth;
    const y = ctx.canvas.height - height;

    const computedStyles = getComputedStyle(document.documentElement);
    const barColor = computedStyles.getPropertyValue("--bar-color").trim();
    const highlightColor = computedStyles
      .getPropertyValue("--highlight-color")
      .trim();
    const sortedColor = computedStyles
      .getPropertyValue("--sorted-color")
      .trim();

    if (sortedHighlight) {
      ctx.fillStyle = sortedColor;
    } else {
      ctx.fillStyle =
        i === highlight1 || i === highlight2 ? highlightColor : barColor;
    }

    ctx.fillRect(x + 1, y, barWidth - 2, height);

    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-color")
      .trim();
    ctx.font = "14px Arial";
    ctx.fillText(value, x + barWidth / 4, y - 5);
  });
}

function setArray() {
  const input = document.getElementById("arrayInput").value;
  try {
    data = input.split(",").map(Number);
    if (data.some(isNaN)) throw new Error();
    resizeCanvas();
    drawData();
    setStatus("Array set. Ready to sort.");
  } catch {
    alert("Invalid input! Please enter comma-separated numbers.");
  }
}

function generateRandomArray() {
  const size = parseInt(document.getElementById("arraySize").value);

  data = Array.from(
    { length: size },
    () => Math.floor(Math.random() * 100) + 1
  );

  // 👇 Insert the array into the input field, comma-separated
  document.getElementById("arrayInput").value = data.join(", ");

  // 👇 Call setArray() to parse and draw
  setArray();

  setStatus("Random array generated.");
}

function setStatus(message) {
  document.getElementById("status").innerText = `Status: ${message}`;
}

function sleep(ms) {
  return new Promise((resolve) => {
    const checkPause = () => {
      if (!isPaused) {
        setTimeout(resolve, ms); // only delay when not paused
      } else {
        setTimeout(checkPause, 50); // check every 50ms until unpaused
      }
    };
    checkPause();
  });
}
function pauseSorting() {
  isPaused = true;
  setStatus("Sorting paused.");
}

function resumeSorting() {
  isPaused = false;
  setStatus("Sorting resumed.");
}
function updateCounters() {
  document.getElementById(
    "counters"
  ).innerText = `Comparisons: ${comparisons} | Swaps: ${swaps}`;
}

function resetCanvas() {
  data = [];
  comparisons = 0;
  swaps = 0;
  updateCounters(); // ✅ add this
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  document.getElementById("arrayInput").value = "";
  document.getElementById("status").innerText = "Status: Reset complete";
  document.getElementById("stats").innerText = "";
}
function toggleButtons(disabled) {
  document.getElementById("arrayInput").disabled = disabled;
  document.querySelector("button[onclick='setArray()']").disabled = disabled;
  document.querySelector("button[onclick='generateRandomArray()']").disabled =
    disabled;
  document.querySelector("button[onclick='startSorting()']").disabled =
    disabled;
  document.querySelector("button[onclick='resetCanvas()']").disabled = disabled;
}

function updateSizeLabel() {
  document.getElementById("arraySizeValue").innerText =
    document.getElementById("arraySize").value;
}

function resizeCanvas() {
  const canvas = document.getElementById("canvas");
  const barWidth = 20; // width per bar
  const spacing = 2; // spacing between bars
  const minWidth = 700; // minimum canvas width
  const totalWidth = data.length * (barWidth + spacing);
  canvas.width = Math.max(totalWidth, minWidth);
  canvas.height = 300; // Keep height fixed
}

function updateSpeedLabel() {
  document.getElementById("speedValue").innerText = `${
    document.getElementById("speedRange").value
  }ms`;
}

function getSpeed() {
  return parseInt(document.getElementById("speedRange").value);
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  drawData(); // Re-render canvas with updated theme

  updateThemeIcon(next); // ⬅ update icon and color
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("themeIcon");
  if (theme === "dark") {
    icon.className = "bi bi-moon-fill";
    icon.style.color = "#f1f1f1"; // bright white moon
  } else {
    icon.className = "bi bi-brightness-high";
    icon.style.color = "#212529"; // dark sun for light background
  }
}

function analyzeCase(arr, algorithm) {
  const mode = document.getElementById("sortMode").value;
  const isSorted = arr.every(
    (val, i, a) =>
      i === 0 || (mode === "asc" ? a[i - 1] <= val : a[i - 1] >= val)
  );
  const isReversed = arr.every(
    (val, i, a) =>
      i === 0 || (mode === "asc" ? a[i - 1] >= val : a[i - 1] <= val)
  );

  switch (algorithm) {
    case "Bubble Sort":
    case "Insertion Sort":
      return isSorted ? "Best" : isReversed ? "Worst" : "Average";
    case "Selection Sort":
    case "Merge Sort":
    case "Heap Sort":
      return "Average"; // Doesn't depend on input order
    case "Quick Sort":
      return isSorted || isReversed ? "Worst" : "Average";
    default:
      return "-";
  }
}

function drawFinalSorted() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const barWidth = ctx.canvas.width / data.length;
  const maxVal = Math.max(...data);

  data.forEach((value, i) => {
    const height = (value / maxVal) * ctx.canvas.height * 0.9;
    const x = i * barWidth;
    const y = ctx.canvas.height - height;

    ctx.fillStyle = "#28a745"; // ✅ Green color for completion
    ctx.fillRect(x + 1, y, barWidth - 2, height);

    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-color")
      .trim();
    ctx.font = "14px Arial";
    ctx.fillText(value, x + barWidth / 4, y - 5);
  });
}

window.onload = () => {
  const current =
    document.documentElement.getAttribute("data-theme") || "light";
  updateThemeIcon(current); // ⬅ call new function on load
};

function drawFinalSorted() {
  sortedHighlight = true;
  drawData();
  sortedHighlight = false;
}
