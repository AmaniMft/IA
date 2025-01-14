class BaseAI {
    constructor(maxDepth = 4) {
        this.maxDepth = maxDepth;
        this.nodesExplored = 0;
        this.executionTime = 0;
        this.memoryUsage = 0;
    }

    resetStats() {
        this.nodesExplored = 0;
        this.executionTime = 0;
        this.memoryUsage = 0;
    }

    getStats() {
        return {
            nodesExplored: this.nodesExplored,
            executionTime: this.executionTime,
            memoryUsage: this.memoryUsage
        };
    }

    measurePerformance(callback) {
        const startTime = process.hrtime();
        const startMemory = process.memoryUsage().heapUsed;
        
        const result = callback();
        
        const endMemory = process.memoryUsage().heapUsed;
        const [seconds, nanoseconds] = process.hrtime(startTime);
        
        this.executionTime = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
        this.memoryUsage = endMemory - startMemory;
        
        return result;
    }
}

module.exports = BaseAI;
