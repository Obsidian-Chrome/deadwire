// Système global de verrouillage pour les easter eggs
window.easterEggLock = {
  isActive: false,
  currentEffect: null,
  
  acquire: function(effectName) {
    if (this.isActive) {
      console.log(`Easter egg "${effectName}" bloqué. "${this.currentEffect}" est en cours.`);
      return false;
    }
    this.isActive = true;
    this.currentEffect = effectName;
    return true;
  },
  
  release: function() {
    this.isActive = false;
    this.currentEffect = null;
  }
};
