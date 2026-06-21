const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lotteryPrinter', {
  printPrizeTicket(ticket) {
    return ipcRenderer.invoke('print-prize-ticket', ticket);
  }
});
