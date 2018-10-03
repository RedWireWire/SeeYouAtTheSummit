var platformGameplayState = function(game) {

}

platformGameplayState.prototype = {

    preload: function() {
        alert("Entered platform gameplay state");

        //Cargar sprites
        game.load.image("personaje", "Assets/Sprites/TestCharacter");
        game.load.image("suelo", "Assets/Sprites/TestGround");
    },

    create: function() {
        //Fondo
        this.stage.backgroundColor = "#333333";
    },

    update: function() {

    }
}