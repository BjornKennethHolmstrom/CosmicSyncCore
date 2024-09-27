import eventBus from './eventBus.js';

class ErrorHandler {
  handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    eventBus.emit('error', { error, context });
  }

  handleAndThrow(error, context) {
    this.handleError(error, context);
    throw error;
  }
}

export default new ErrorHandler();
