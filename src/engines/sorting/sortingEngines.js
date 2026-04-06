// Sorting algorithm step generators
// Each yields: { array, comparing, swapping, sorted, line, meta? }
// meta: algo-specific data for unique visualizations

// ── Bubble Sort ──
// Shows a "sorted boundary" — sorted elements accumulate from the RIGHT
// The current "bubble" pair is highlighted as it travels left to right
export function* bubbleSort(arr) {
  const a = [...arr]
  const n = a.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // The sorted boundary is everything from (n-i) to (n-1)
      const sortedRange = Array.from({length: i}, (_, k) => n - 1 - k)
      yield {
        array: [...a],
        comparing: [j, j + 1],
        swapping: [],
        sorted: sortedRange,
        line: 3,
        meta: { type: 'bubble', unsortedEnd: n - i - 1, pass: i }
      }
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        yield {
          array: [...a],
          comparing: [],
          swapping: [j, j + 1],
          sorted: sortedRange,
          line: 4,
          meta: { type: 'bubble', unsortedEnd: n - i - 1, pass: i }
        }
      }
    }
  }
  yield { array: [...a], comparing: [], swapping: [], sorted: Array.from({length: n}, (_, k) => k), line: -1 }
}

// ── Selection Sort ──
// Shows sorted region on LEFT, highlights the current minimum tracked
export function* selectionSort(arr) {
  const a = [...arr]
  const n = a.length
  const sorted = []
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      yield {
        array: [...a],
        comparing: [minIdx, j],
        swapping: [],
        sorted: [...sorted],
        line: 3,
        meta: { type: 'selection', sortedBoundary: i, currentMin: minIdx, scanPos: j }
      }
      if (a[j] < a[minIdx]) minIdx = j
    }
    if (minIdx !== i) {
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
      yield {
        array: [...a],
        comparing: [],
        swapping: [i, minIdx],
        sorted: [...sorted],
        line: 5,
        meta: { type: 'selection', sortedBoundary: i, currentMin: minIdx }
      }
    }
    sorted.push(i)
  }
  sorted.push(n - 1)
  yield { array: [...a], comparing: [], swapping: [], sorted, line: -1 }
}

// ── Insertion Sort ──
// Shows sorted portion on LEFT, the "key" being inserted floats visually
export function* insertionSort(arr) {
  const a = [...arr]
  const n = a.length
  const sorted = [0]
  for (let i = 1; i < n; i++) {
    const key = a[i]
    let j = i - 1
    yield {
      array: [...a],
      comparing: [i],
      swapping: [],
      sorted: [...sorted],
      line: 2,
      meta: { type: 'insertion', keyIndex: i, keyValue: key, sortedEnd: i }
    }
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]
      yield {
        array: [...a],
        comparing: [j, j + 1],
        swapping: [j, j + 1],
        sorted: [...sorted],
        line: 4,
        meta: { type: 'insertion', keyIndex: j, keyValue: key, insertPos: j, sortedEnd: i }
      }
      j--
    }
    a[j + 1] = key
    sorted.push(i)
    yield {
      array: [...a],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      line: 5,
      meta: { type: 'insertion', placed: j + 1, keyValue: key, sortedEnd: i + 1 }
    }
  }
  yield { array: [...a], comparing: [], swapping: [], sorted: Array.from({length: n}, (_, k) => k), line: -1 }
}

// ── Merge Sort ──
// Progressive tree: nodes only become visible when parent splits
// Left subtree completes fully before right subtree starts
export function* mergeSort(arr) {
  const a = [...arr]
  const n = a.length

  // Build the recursion tree structure
  const treeNodes = []
  let nodeId = 0

  function buildTree(start, end, depth, parent) {
    const id = nodeId++
    const node = {
      id, start, end, depth, parent,
      left: null, right: null,
      values: arr.slice(start, end),
      state: 'idle',
      visible: id === 0 // only root is visible initially
    }
    treeNodes.push(node)
    if (end - start > 1) {
      const mid = Math.floor((start + end) / 2)
      node.left = buildTree(start, mid, depth + 1, id)
      node.right = buildTree(mid, end, depth + 1, id)
    }
    return id
  }
  buildTree(0, n, 0, null)

  function getTreeSnapshot() {
    return treeNodes.map(nd => ({
      id: nd.id, start: nd.start, end: nd.end, depth: nd.depth,
      parent: nd.parent, left: nd.left, right: nd.right,
      values: [...nd.values], state: nd.state, visible: nd.visible
    }))
  }

  function setNodeState(id, state, values) {
    treeNodes[id].state = state
    if (values) treeNodes[id].values = values
  }

  function makeChildrenVisible(id) {
    const node = treeNodes[id]
    if (node.left !== null) treeNodes[node.left].visible = true
    if (node.right !== null) treeNodes[node.right].visible = true
  }

  // Pseudocode line mapping:
  // 0: mergeSort(arr, l, r):
  // 1:   if l < r:
  // 2:     mid = (l + r) / 2
  // 3:     mergeSort(arr, l, mid)
  // 4:     mergeSort(arr, mid+1, r)
  // 5:     merge(arr, l, mid, r)
  // 6: merge(arr, l, mid, r):
  // 7:   i=0, j=0, k=l
  // 8:   while i < len(L) and j < len(R):
  // 9:     if L[i] <= R[j]:
  // 10:      result[k++] = L[i++]
  // 11:    else:
  // 12:      result[k++] = R[j++]
  // 13:  copy remaining elements

  function* ms(nodeIdx) {
    const node = treeNodes[nodeIdx]
    const { start, end } = node

    if (end - start <= 1) {
      // Base case — single element
      setNodeState(nodeIdx, 'merged')
      yield {
        array: [...a], comparing: [], swapping: [], sorted: [], line: 1,
        meta: {
          type: 'merge', tree: getTreeSnapshot(),
          activeNode: nodeIdx, action: 'base',
          desc: `[${a.slice(start, end)}] — single element, already sorted`
        }
      }
      return
    }

    // Step 1: Show "entering" this call
    setNodeState(nodeIdx, 'active')
    yield {
      array: [...a], comparing: [], swapping: [], sorted: [], line: 0,
      meta: {
        type: 'merge', tree: getTreeSnapshot(),
        activeNode: nodeIdx, action: 'enter',
        desc: `mergeSort([${a.slice(start, end)}], ${start}, ${end - 1})`
      }
    }

    // Step 2: Calculate mid, make children visible
    const mid = Math.floor((start + end) / 2)
    setNodeState(nodeIdx, 'splitting')
    makeChildrenVisible(nodeIdx)
    yield {
      array: [...a], comparing: [], swapping: [], sorted: [], line: 2,
      meta: {
        type: 'merge', tree: getTreeSnapshot(),
        activeNode: nodeIdx, action: 'split',
        desc: `mid = ${mid}  →  Split into [${a.slice(start, mid)}] and [${a.slice(mid, end)}]`
      }
    }

    // Step 3: Recurse left (LEFT SUBTREE FULLY COMPLETES FIRST)
    setNodeState(nodeIdx, 'waiting')
    yield {
      array: [...a], comparing: [], swapping: [], sorted: [], line: 3,
      meta: {
        type: 'merge', tree: getTreeSnapshot(),
        activeNode: nodeIdx, action: 'recurse-left',
        desc: `Recursing into left: mergeSort([${a.slice(start, mid)}], ${start}, ${mid - 1})`
      }
    }
    yield* ms(node.left)

    // Step 4: Recurse right (ONLY AFTER LEFT IS DONE)
    setNodeState(nodeIdx, 'waiting')
    yield {
      array: [...a], comparing: [], swapping: [], sorted: [], line: 4,
      meta: {
        type: 'merge', tree: getTreeSnapshot(),
        activeNode: nodeIdx, action: 'recurse-right',
        desc: `Recursing into right: mergeSort([${a.slice(mid, end)}], ${mid}, ${end - 1})`
      }
    }
    yield* ms(node.right)

    // Step 5: Begin merging
    setNodeState(nodeIdx, 'merging')
    const left = a.slice(start, mid)
    const right = a.slice(mid, end)
    let i = 0, j = 0, k = start

    yield {
      array: [...a], comparing: [], swapping: [], sorted: [], line: 6,
      meta: {
        type: 'merge', tree: getTreeSnapshot(),
        activeNode: nodeIdx, action: 'merge-start',
        desc: `merge([${left}], [${right}]) — begin merging`
      }
    }

    while (i < left.length && j < right.length) {
      // Compare
      yield {
        array: [...a], comparing: [start + i, mid + j], swapping: [], sorted: [], line: 9,
        meta: {
          type: 'merge', tree: getTreeSnapshot(),
          activeNode: nodeIdx, action: 'compare',
          desc: `Comparing ${left[i]} ≤ ${right[j]}?  →  ${left[i] <= right[j] ? 'Yes, pick left' : 'No, pick right'}`
        }
      }
      if (left[i] <= right[j]) {
        a[k++] = left[i++]
        setNodeState(nodeIdx, 'merging', a.slice(start, end))
        yield {
          array: [...a], comparing: [], swapping: [k - 1], sorted: [], line: 10,
          meta: {
            type: 'merge', tree: getTreeSnapshot(),
            activeNode: nodeIdx, action: 'place',
            desc: `Placed ${a[k - 1]} from L into position ${k - 1}`
          }
        }
      } else {
        a[k++] = right[j++]
        setNodeState(nodeIdx, 'merging', a.slice(start, end))
        yield {
          array: [...a], comparing: [], swapping: [k - 1], sorted: [], line: 12,
          meta: {
            type: 'merge', tree: getTreeSnapshot(),
            activeNode: nodeIdx, action: 'place',
            desc: `Placed ${a[k - 1]} from R into position ${k - 1}`
          }
        }
      }
    }
    while (i < left.length) {
      a[k++] = left[i++]
      setNodeState(nodeIdx, 'merging', a.slice(start, end))
      yield {
        array: [...a], comparing: [], swapping: [k - 1], sorted: [], line: 13,
        meta: { type: 'merge', tree: getTreeSnapshot(), activeNode: nodeIdx, action: 'place', desc: `Copy remaining L: ${a[k - 1]}` }
      }
    }
    while (j < right.length) {
      a[k++] = right[j++]
      setNodeState(nodeIdx, 'merging', a.slice(start, end))
      yield {
        array: [...a], comparing: [], swapping: [k - 1], sorted: [], line: 13,
        meta: { type: 'merge', tree: getTreeSnapshot(), activeNode: nodeIdx, action: 'place', desc: `Copy remaining R: ${a[k - 1]}` }
      }
    }

    // Done merging
    setNodeState(nodeIdx, 'merged', a.slice(start, end))
    yield {
      array: [...a], comparing: [], swapping: [], sorted: [], line: 5,
      meta: {
        type: 'merge', tree: getTreeSnapshot(),
        activeNode: nodeIdx, action: 'merged',
        desc: `✓ Merged → [${a.slice(start, end)}]`
      }
    }
  }

  yield* ms(0)
  yield { array: [...a], comparing: [], swapping: [], sorted: Array.from({length: n}, (_, k) => k), line: -1 }
}

// ── Quick Sort ──
// Shows pivot element distinctly, partition boundaries
export function* quickSort(arr) {
  const a = [...arr]
  const n = a.length
  const finalSorted = []
  
  function* qs(lo, hi) {
    if (lo >= hi) {
      if (lo === hi) finalSorted.push(lo)
      return
    }
    const pivot = a[hi]
    const pivotIdx = hi
    let i = lo
    for (let j = lo; j < hi; j++) {
      yield {
        array: [...a],
        comparing: [j, pivotIdx],
        swapping: [],
        sorted: [...finalSorted],
        line: 4,
        meta: { type: 'quick', pivot: pivotIdx, pivotValue: pivot, partitionRange: [lo, hi], i, j, lessThan: [lo, i - 1], greaterThan: [i, j - 1] }
      }
      if (a[j] < pivot) {
        ;[a[i], a[j]] = [a[j], a[i]]
        yield {
          array: [...a],
          comparing: [],
          swapping: [i, j],
          sorted: [...finalSorted],
          line: 5,
          meta: { type: 'quick', pivot: pivotIdx, pivotValue: pivot, partitionRange: [lo, hi], i: i + 1, j }
        }
        i++
      }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    finalSorted.push(i)
    yield {
      array: [...a],
      comparing: [],
      swapping: [i, hi],
      sorted: [...finalSorted],
      line: 7,
      meta: { type: 'quick', pivotPlaced: i, pivotValue: pivot, partitionRange: [lo, hi] }
    }
    yield* qs(lo, i - 1)
    yield* qs(i + 1, hi)
  }
  
  yield* qs(0, n - 1)
  yield { array: [...a], comparing: [], swapping: [], sorted: Array.from({length: n}, (_, k) => k), line: -1 }
}

// ── Heap Sort ──
// Emits sorted indices so tree+array can shade sorted portion
export function* heapSort(arr) {
  const a = [...arr]
  const n = a.length
  const sorted = []

  function* heapify(size, i) {
    let largest = i
    const l = 2 * i + 1
    const r = 2 * i + 2
    if (l < size) {
      yield { array: [...a], comparing: [largest, l], swapping: [], sorted: [...sorted], line: 3, meta: { type: 'heap', heapSize: size } }
      if (a[l] > a[largest]) largest = l
    }
    if (r < size) {
      yield { array: [...a], comparing: [largest, r], swapping: [], sorted: [...sorted], line: 4, meta: { type: 'heap', heapSize: size } }
      if (a[r] > a[largest]) largest = r
    }
    if (largest !== i) {
      ;[a[i], a[largest]] = [a[largest], a[i]]
      yield { array: [...a], comparing: [], swapping: [i, largest], sorted: [...sorted], line: 6, meta: { type: 'heap', heapSize: size } }
      yield* heapify(size, largest)
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i)
  }

  // Extract max elements
  for (let i = n - 1; i > 0; i--) {
    ;[a[0], a[i]] = [a[i], a[0]]
    sorted.push(i)
    yield { array: [...a], comparing: [], swapping: [0, i], sorted: [...sorted], line: 10, meta: { type: 'heap', heapSize: i } }
    // For heapify steps within this extraction, pass sorted
    const prevHeapify = heapify
    function* heapifyWithSorted(size, idx) {
      let largest = idx
      const l = 2 * idx + 1
      const r = 2 * idx + 2
      if (l < size) {
        yield { array: [...a], comparing: [largest, l], swapping: [], sorted: [...sorted], line: 3, meta: { type: 'heap', heapSize: size } }
        if (a[l] > a[largest]) largest = l
      }
      if (r < size) {
        yield { array: [...a], comparing: [largest, r], swapping: [], sorted: [...sorted], line: 4, meta: { type: 'heap', heapSize: size } }
        if (a[r] > a[largest]) largest = r
      }
      if (largest !== idx) {
        ;[a[idx], a[largest]] = [a[largest], a[idx]]
        yield { array: [...a], comparing: [], swapping: [idx, largest], sorted: [...sorted], line: 6, meta: { type: 'heap', heapSize: size } }
        yield* heapifyWithSorted(size, largest)
      }
    }
    yield* heapifyWithSorted(i, 0)
  }
  sorted.push(0)
  yield { array: [...a], comparing: [], swapping: [], sorted, line: -1 }
}

export const algorithms = {
  bubble: { name: 'Bubble Sort', fn: bubbleSort, complexity: 'O(n²)', space: 'O(1)' },
  selection: { name: 'Selection Sort', fn: selectionSort, complexity: 'O(n²)', space: 'O(1)' },
  insertion: { name: 'Insertion Sort', fn: insertionSort, complexity: 'O(n²)', space: 'O(1)' },
  merge: { name: 'Merge Sort', fn: mergeSort, complexity: 'O(n log n)', space: 'O(n)' },
  quick: { name: 'Quick Sort', fn: quickSort, complexity: 'O(n log n)', space: 'O(log n)' },
  heap: { name: 'Heap Sort', fn: heapSort, complexity: 'O(n log n)', space: 'O(1)' },
}

export const pseudocode = {
  bubble: `for i = 0 to n-1:
  for j = 0 to n-i-1:
    if arr[j] > arr[j+1]:
      swap(arr[j], arr[j+1])`,
  selection: `for i = 0 to n-1:
  minIdx = i
  for j = i+1 to n:
    if arr[j] < arr[minIdx]:
      minIdx = j
  swap(arr[i], arr[minIdx])`,
  insertion: `for i = 1 to n:
  key = arr[i]
  j = i - 1
  while j >= 0 and arr[j] > key:
    arr[j+1] = arr[j]
    j = j - 1
  arr[j+1] = key`,
  merge: `mergeSort(arr, l, r):
  if l < r:
    mid = (l + r) / 2
    mergeSort(arr, l, mid)
    mergeSort(arr, mid+1, r)
    merge(arr, l, mid, r)
merge(arr, l, mid, r):
  L = arr[l..mid], R = arr[mid+1..r]
  i=0, j=0, k=l
  if L[i] <= R[j]:
    result[k++] = L[i++]
  else:
    result[k++] = R[j++]
  copy remaining elements`,
  quick: `quickSort(arr, lo, hi):
  if lo < hi:
    pivot = arr[hi]
    i = lo
    for j = lo to hi-1:
      if arr[j] < pivot:
        swap(arr[i], arr[j])
        i++
    swap(arr[i], arr[hi])
    quickSort(arr, lo, i-1)
    quickSort(arr, i+1, hi)`,
  heap: `heapSort(arr):
  buildMaxHeap(arr)
  for i = n-1 to 1:
    swap(arr[0], arr[i])
    heapify(arr, i, 0)`,
}
