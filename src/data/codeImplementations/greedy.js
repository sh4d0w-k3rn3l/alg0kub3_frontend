// Greedy algorithm implementations

export const greedyCode = {
  "jump-game-2": {
    java: `public int jump(int[] nums) {
    int jumps = 0, currentEnd = 0, farthest = 0;
    
    for (int i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        
        if (i == currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }
    
    return jumps;
}`,
    python: `def jump(nums):
    jumps = 0
    current_end = 0
    farthest = 0
    
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        
        if i == current_end:
            jumps += 1
            current_end = farthest
    
    return jumps`,
    javascript: `function jump(nums) {
    let jumps = 0, currentEnd = 0, farthest = 0;
    
    for (let i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        
        if (i === currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }
    
    return jumps;
}`
  },
  "gas-station": {
    java: `public int canCompleteCircuit(int[] gas, int[] cost) {
    int totalTank = 0, currentTank = 0;
    int startStation = 0;
    
    for (int i = 0; i < gas.length; i++) {
        int gain = gas[i] - cost[i];
        totalTank += gain;
        currentTank += gain;
        
        if (currentTank < 0) {
            startStation = i + 1;
            currentTank = 0;
        }
    }
    
    return totalTank >= 0 ? startStation : -1;
}`,
    python: `def canCompleteCircuit(gas, cost):
    total_tank = 0
    current_tank = 0
    start_station = 0
    
    for i in range(len(gas)):
        gain = gas[i] - cost[i]
        total_tank += gain
        current_tank += gain
        
        if current_tank < 0:
            start_station = i + 1
            current_tank = 0
    
    return start_station if total_tank >= 0 else -1`,
    javascript: `function canCompleteCircuit(gas, cost) {
    let totalTank = 0, currentTank = 0;
    let startStation = 0;
    
    for (let i = 0; i < gas.length; i++) {
        const gain = gas[i] - cost[i];
        totalTank += gain;
        currentTank += gain;
        
        if (currentTank < 0) {
            startStation = i + 1;
            currentTank = 0;
        }
    }
    
    return totalTank >= 0 ? startStation : -1;
}`
  }
};
