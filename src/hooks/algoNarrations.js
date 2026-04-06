// Algorithm explanations — spoken when visualization starts
// Like a professor explaining before the demo runs

export const ALGO_INTROS = {
  // Sorting
  bubble: "Bubble Sort works by repeatedly comparing neighboring elements and swapping them if they're out of order. After each full pass, the largest unsorted element settles into its final position — like a bubble rising to the surface. It takes up to n minus 1 passes for n elements, giving O n squared time complexity.",
  selection: "Selection Sort divides the array into a sorted and unsorted region. In each step, it scans the entire unsorted region to find the minimum element, then swaps it to the boundary of the sorted region. This always makes exactly n minus 1 swaps, making it good when writes are expensive.",
  insertion: "Insertion Sort builds the sorted array one element at a time — like sorting playing cards in your hand. It picks up each element and slides it left until it finds its correct position among already-sorted elements. It's fast on nearly sorted data, with O n best case.",
  merge: "Merge Sort is a divide-and-conquer algorithm. It recursively splits the array in half until single elements remain, then merges pairs back together in sorted order. Merging two sorted arrays is efficient, giving guaranteed O n log n performance in all cases.",
  quick: "Quick Sort picks a pivot element, then partitions: everything smaller goes left, everything larger goes right. It recurses on both sides. With a good pivot, this is O n log n average — one of the fastest practical sorting algorithms due to excellent cache performance.",
  heap: "Heap Sort first builds a max-heap structure from the array, placing the largest value at the root. It then repeatedly removes the root (the maximum), places it at the array's end, and fixes the heap. This achieves O n log n time with O 1 extra memory.",

  // Searching
  binary: "Binary Search finds a target in a sorted array by repeatedly cutting the search space in half. Compare with the middle element: if it's a match, done. If target is smaller, search the left half; if larger, search the right half. Each step halves the remaining elements — O log n total.",
  linear: "Linear Search simply checks each element from the beginning until it finds the target or exhausts the array. It works on both sorted and unsorted data, but requires O n time. For sorted data, binary search is far more efficient. Linear search shines when data is small or unsorted.",

  // DP
  fibonacci: "We compute Fibonacci using bottom-up dynamic programming — also called tabulation. Instead of recursing and recomputing identical subproblems, we store results in a table. Each dp[i] equals dp[i-1] plus dp[i-2]. This uses O n time and O n space versus exponential time for naive recursion.",
  coinChange: "Coin Change uses dynamic programming to find the minimum coins for each amount from zero to the target. For each amount, we try every coin: if using that coin and adding one to the result for the remaining amount gives fewer coins, we update. This solves optimally in O amount times coins time.",
  knapsack01: "The zero-one Knapsack problem: given items with weights and values, pick a subset to maximize value without exceeding capacity. Each item is either taken or left — hence zero-one. We build a 2D table where dp[i][w] is the maximum value using the first i items with weight limit w.",
  lcs: "Longest Common Subsequence finds the longest sequence of characters that appears in the same order in both strings, but not necessarily contiguously. We fill a 2D table: if characters match, we extend the diagonal cell by one. Otherwise we take the max of the cell above or to the left.",
  matrixChain: "Matrix Chain Multiplication finds the optimal order to multiply a chain of matrices. Different parenthesizations have wildly different costs. We use a DP table where dp[i][j] stores the minimum scalar multiplications needed to compute matrices i through j.",
  floydWarshall: "Floyd-Warshall computes shortest paths between every pair of vertices in one sweep. For each possible intermediate vertex k, we check: is the path from i to j through k shorter than the current best direct path? After considering all n vertices as intermediates, we have all-pairs shortest paths.",

  // Greedy
  knapsack: "Fractional Knapsack: unlike 0/1 knapsack, we can take fractions of items. The greedy strategy is to sort items by value-to-weight ratio and always pick the most valuable item per unit weight first. This greedy choice is provably optimal because we can always fill remaining space with the next best item.",
  jobseq: "Job Sequencing with Deadlines: schedule jobs to maximize profit where each job has a deadline and profit. Sort by profit descending. Greedily assign each job to the latest available slot before its deadline. This maximizes total profit by always trying to fit high-profit jobs first.",
  prims: "Prim's Algorithm builds a Minimum Spanning Tree by growing a tree one edge at a time. Starting from any vertex, always add the cheapest edge connecting a tree vertex to a non-tree vertex. This greedy choice is locally optimal and, by the cut property, leads to a globally optimal MST.",
  kruskals: "Kruskal's Algorithm builds a Minimum Spanning Tree by processing edges in order of increasing weight. For each edge, add it to the MST only if it doesn't create a cycle — checked using a disjoint set. This continues until n minus 1 edges are added.",
  dijkstra: "Dijkstra's Algorithm finds shortest paths from a source vertex to all others in a weighted graph with non-negative edges. It greedily visits the unvisited vertex with the smallest known distance, then relaxes all its neighboring edges — updating distances if a shorter path is found.",
  'merge-pattern': "Optimal File Merge: to merge files with minimum total cost, always merge the two smallest files first. This is because smaller merges early avoid paying for large sizes repeatedly. A min-heap efficiently finds the two smallest files at each step.",
}
