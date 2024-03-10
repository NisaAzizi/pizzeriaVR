AFRAME.registerComponent("random-list", {
  init: function () {
    const items = ["Mushrooms", "Onions", "Peppers", "Olives", "Pepperonis"];

    // Fonction pour obtenir des éléments uniques de 'items'
    function getRandomUniqueItems(arr, count) {
      const shuffled = arr.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }

    // Générer une liste de 2 à 5 éléments uniques
    const listSize = Math.floor(Math.random() * 4) + 2;
    const randomItems = getRandomUniqueItems(items, listSize);

    // Créer le texte de la liste
    const listText = randomItems.join("\n");

    this.listText = listText;

    // Mettre à jour l'élément avec l'ID 'list' avec la liste
    const listEl = document.querySelector("#list");
    listEl.setAttribute("value", listText);
  },
});
