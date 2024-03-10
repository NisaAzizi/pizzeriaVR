<script setup>
  import { ref, nextTick } from 'vue';

  import TheCameraRig from './TheCameraRig.vue';
  import '../aframe/physx-grab.js';
  import '../aframe/physx-force-pushable.js';
  import '../aframe/physx-grab.js';
  import '../aframe/random-list.js';

  defineProps({
    scale: Number,
    overlaySelector: String,
  });
  let isBorderContact = ref(false);
  const hasHitPizza = new Set();
  const tabIngredients = ref([]);
  const countdown = ref(10); 
  let countdownInterval;
  const crustElement = ref(null);
  const pizzaBox = ref(false);
  const initialToppingsPositions = {
  Peppers: { x: -0.6, y: 1, z: 1.5 },
  Pepperonis: { x: -0.6, y: 1, z: 1.5 },
  Olives: { x: -0.79, y: 1, z: 1.12 },
  Onions: { x: -0.58, y: 1, z: 0.78 },
  Mushrooms: { x: -0.96, y: 4, z: 0.808 },
};

function resetIngredientsPositions() {
  const toppings = document.getElementsByClassName('onPizza');

  for (var i = 0; i < toppings.length; i++) {
    const topping = toppings[i];
    const initialPosition = topping.initialPosition;
    if (initialPosition) {
      topping.setAttribute('position', `${initialPosition.x} ${initialPosition.y} ${initialPosition.z}`);
      console.log("Reset position:", topping.getAttribute('position'));
    }
  }
}

/*   function hit(evt) {
     console.log('hit border'); 
    isBorderContact.value = true;
  }

  function unhit(evt) {
     console.log('unhit border'); 
    isBorderContact.value = false;
  } */


  function detectObject(evt) {
  const objectFound = evt.detail.otherComponent.el;
  const listElement = document.getElementById('list');
  if (hasHitPizza.has(objectFound)) return;
  hasHitPizza.add(objectFound);
  tabIngredients.value.push(objectFound.id);
  console.log(tabIngredients.value)
  objectFound.setAttribute('physx-body', 'type', 'static');
  objectFound.setAttribute('physx-body', 'type', 'dynamic');
  objectFound.setAttribute('class', 'onPizza');

  // Store initial position in the element itself
  if (!objectFound.initialPosition) {
    objectFound.initialPosition = objectFound.getAttribute('position').clone();
  }

  if (listElement && listElement.getAttribute('value')) {
    const idsList = listElement.getAttribute('value').split('\n');
    const cleanIdsList = idsList.map(id => id.trim());
    if (cleanIdsList.includes(objectFound.id)) {
      console.log('Objet trouvé pizza:', objectFound.id);
    }
    compareIngredients(cleanIdsList);
  }
}


function compareIngredients(cleanIdsList) {
  const text = document.querySelector('#firstText');
  const prepare = document.querySelector('#prepareOrderText');
  const countdownText = document.querySelector('#countdownText');
  const toppings = document.querySelector('.onPizza')
      const tabIngredientsArray = tabIngredients.value.slice().sort();
      const cleanIdsListSorted = cleanIdsList.slice().sort();
      if (JSON.stringify(tabIngredientsArray) === JSON.stringify(cleanIdsListSorted)) {
        console.log('Tous les ingrédients sont sur la pizza.');
        tabIngredients.value = []; 
        text.setAttribute('value', 'The order is ready. \n  < The pizza is in the oven.');
        prepare.setAttribute('value', '');
        countdownText.setAttribute('visible', true);
        startCountdown();
        crustElement.value.setAttribute('visible', false);
        toppings.setAttribute('visible', false);
      } else {
        console.log('Certains ingrédients manquent ou sont faux.');
      }
  }


  function detectObjectLeaving(evt) {
  const objectLeaving = evt.detail.otherComponent.el;
  if (objectLeaving.classList.contains('ingredients')) {
    const index = tabIngredients.value.indexOf(objectLeaving.id);
    if (index > -1) {
      tabIngredients.value.splice(index, 1); 
      console.log('Ingredient removed:', objectLeaving.id);
    }
    objectLeaving.removeAttribute('class', 'onPizza');
}}

  function startCountdown() {
    const text = document.querySelector('#firstText');
    const countdownText = document.querySelector('#countdownText');
    const box = document.querySelector('#pizzaBox');
    const scene = document.querySelector('a-scene');
    //add my sound to scene
    const sound = document.createElement('a-sound');
    sound.setAttribute('src', '#sound-2');
    sound.setAttribute('autoplay', true);
    sound.setAttribute('loop', false);
    scene.appendChild(sound);
    countdownInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value === 0) {
        clearInterval(countdownInterval);
        text.setAttribute('value', 'The pizza is ready and in the box. \n  Take it from the kitchen to the delivery bag.');
        countdownText.setAttribute('visible', false);
        pizzaBox.value = true;
      }
    }, 1000); 
  }

  function delivered(evt) {
    const objectFound = evt.detail.otherComponent.el.id;
    if (objectFound === 'bag') {
    console.log("contact")
    resetGame();
  }}

  function resetGame() {
    hasHitPizza.clear();
    tabIngredients.value = [];
    countdown.value = 10;
    clearInterval(countdownInterval);
    const scene = document.querySelector('a-scene');
    const text = document.querySelector('#firstText');
    const prepare = document.querySelector('#prepareOrderText');
    const countdownText = document.querySelector('#countdownText');
    const toppings = document.querySelector('.onPizza');

    text.setAttribute('value', 'Choose the right ingredients');
    prepare.setAttribute('value', 'Welcome to your pizzeria ! \n Turn around to start preparing orders');
    countdownText.setAttribute('visible', false);
    pizzaBox.value = false;
    crustElement.value.setAttribute('visible', true);
    toppings.setAttribute('visible', true);
    toppings.setAttribute('position', '0 0 0');
  
    const listElement = document.querySelector("#list");
   listElement.parentNode.removeChild(listElement);
   const newList = document.createElement('a-text'); 
   newList.setAttribute('random-list', '');
   newList.id = "list";
   newList.setAttribute('position', '0.136 0.928 1.064');
   newList.setAttribute('rotation', '-90 180 5');
   newList.setAttribute('scale','0.15 0.15 0.15');
   newList.setAttribute('color', 'black');
   scene.appendChild(newList);

   resetIngredientsPositions();
  }

  const allAssetsLoaded = ref(false);
</script>

<template>
  <a-scene
    background="color: skyblue;"
    :webxr="`
      requiredFeatures: local-floor;
      referenceSpaceType: local-floor;
      optionalFeatures: dom-overlay;
      overlayElement: ${overlaySelector};
    `"
    xr-mode-ui="XRMode: xr"
    physx="
      autoLoad: true;
      delay: 1000;
      useDefaultScene: false;
      wasmUrl: lib/physx.release.wasm;
    "
    stats

  >
  

    <a-assets @loaded="allAssetsLoaded = true">
    
      <a-asset-item id="kitchen" src="assets/kitchen_interior.glb"></a-asset-item>
      <a-asset-item id="table" src="assets/table.glb"></a-asset-item>
      <!--
        Title: Low Poly Kitchen
        Model source: https://sketchfab.com/3d-models/low-poly-kitchen-63b1f9062c824abcbaf23ce1f8465ba9
        Model author: https://sketchfab.com/Gman08
        Model license: CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/ )
      -->

      <a-asset-item id="pizzeria" src="assets/pizzeria2.glb"></a-asset-item>
      <a-asset-item id="city" src="assets/ville.glb"></a-asset-item>
      <!--
        Title: City
        Model source: https://sketchfab.com/3d-models/city-deb4dc75e62346c19c117bf61334eeb5
        Model author: https://sketchfab.com/Invictus.Art.00
        Model license: CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/ )
      -->
      <a-asset-item id="box" src="assets/pizza_box.glb"></a-asset-item>
      <!--
        Title: Pizza pro
        Model source: https://sketchfab.com/3d-models/pizza-prop-7071a74af55b4322b91ed13a686bd581
        Model author: https://sketchfab.com/HiItsSterre
        Model license: CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/ )
      -->

      <a-asset-item id="bowl" src="assets/bowl2.glb"></a-asset-item>
      <!--
        Title: Bowl
        Model source: https://sketchfab.com/3d-models/bowl-c4e0e97a99714b5685bea23c2b558723
        Model author: https://sketchfab.com/Lokko_k
        Model license: CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/ )
      -->

      <a-asset-item id="onions" src="assets/onions.glb"></a-asset-item>
      <a-asset-item id="mushrooms" src="assets/mushrooms.glb"></a-asset-item>
      <a-asset-item id="pOnions" src="assets/pileOnions.glb"></a-asset-item>
      <a-asset-item id="crust" src="assets/crust2.glb"></a-asset-item>
      <a-asset-item id="onions" src="assets/onions.glb"></a-asset-item>
      <a-asset-item id="pMushrooms" src="assets/pileMushrooms.glb"></a-asset-item>
      <a-asset-item id="pOlives" src="assets/pileOlives.glb"></a-asset-item>
      <a-asset-item id="pPeppers" src="assets/pilePeppers.glb"></a-asset-item>
      <a-asset-item id="pPepperonis" src="assets/pilePepperonis.glb"></a-asset-item>
      <a-asset-item id="peppers" src="assets/peppers.glb"></a-asset-item>
      <a-asset-item id="pepperonis" src="assets/pepperonis.glb"></a-asset-item>
      <a-asset-item id="olives" src="assets/olives.glb"></a-asset-item>
      <!--
        Title: Pizza
        Model source: https://sketchfab.com/3d-models/pizza-1265fca2c98d4a808f5f9b6fc840aa39
        Model author: https://sketchfab.com/strawbie133
        Model license: CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/)
      -->

      <a-asset-item id="paper" src="assets/paper.glb"></a-asset-item>
      <!--
        Title: Paper
        Model source:  https://sketchfab.com/3d-models/paper-e7eeeecef3204e65bde08976a77531ab
        Model author: https://sketchfab.com/RosannaFaulkner
        Model license: CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/ )
      -->

      <a-asset-item id="bag" src="assets/food_delivery_bag.glb"></a-asset-item>
       <!--
        Title: Food delivery Bag 3d Model
        Model source:  https://sketchfab.com/3d-models/food-delivery-bag-3d-model-7114d5f4f37a49e490f7add2e22db0e4
        Model author: https://sketchfab.com/Akram.Rashid
        Model license: CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/ )
      -->

      <a-asset-item id="sound-1" response-type="arraybuffer" src="assets/backgroundMusic.mp3" preload="auto"></a-asset-item>
      <!--
        Title: Italian Music Instrumental Classic [No Copyright Music]
        Source : https://www.youtube.com/watch?v=XgpxpTe5pus&list=PLFzjr1Urf6kt4Z7WGi9_ca1PejgCo-bVL&index=14&ab_channel=AlwaysMusic
        Author : https://www.youtube.com/@AlwaysNoCopyrightMusic
      -->

      <a-asset-item id="sound-2" response-type="arraybuffer" src="assets/kitchen-timer-87485.mp3" preload="auto"></a-asset-item>
      <!--
        Title: Kitchen Timer
        Source : https://www.youtube.com/watch?v=Xj1-1-1-1-1&list=PLFzjr1Urf6kt4Z7WGi9_ca1PejgCo-bVL&index=15&ab_channel=AlwaysMusic
        Author : https://www.youtube.com/@AlwaysNoCopyrightMusic
      -->

    </a-assets>

   

    

    <template v-if="allAssetsLoaded">
      <a-sound src="#sound-1" autoplay="true" loop="true" volume="0.5"></a-sound>

      <a-box width="1" height="1" depth="0.160" position="3.40605 0.53714 -0.78222" geometry="height: 1.06; depth: 3.22" physx-body="type: static" visible="false"></a-box>
      <a-box width="1" height="1" depth="0.160" position="3.33697 0.86473 1.34471" geometry="height: 1.77; depth: 1.12" physx-body="type: static" visible="false" ></a-box>
      <a-box width="1" height="1" depth="0.160" position="0.08249 4.60744 -0.34878" geometry="width: 7.4; height: 0.32; depth: 4.54" material="color: #d0bd81"></a-box>


      <a-text id="prepareOrderText" value="Welcome to your pizzeria ! \n
      Turn around to start preparing orders" position="0 1.8 -1.7" color="black" align="center" scale="1 1 1"></a-text>
      <a-text id="firstText" position="0 1.8 1.82857" rotation="0 180 0" color="black" align="center" scale="" value="Choose the right ingredients"></a-text>
      <a-text id="countdownText" position="0 1.36 1.82857" rotation="0 180 0" color="black" align="center" scale="" :value="countdown" visible="false"></a-text>

      <a-entity gltf-model="#pizzeria" position="0 -0.23 0" scale="0.0063 0.0063 0.0063" rotation="0 180 0"></a-entity>
      <a-entity gltf-model="#city" position="1.62 -2.89046 -3.2" scale="0.006 0.006 0.006" rotation="0 90 0"></a-entity>
      <a-entity gltf-model="#kitchen" position="0.122 0.280 0.5" rotation="0 -90 0" scale="1.16 1.16 1.16"></a-entity>

      <a-entity id="bag" gltf-model="#bag" position="-2.851 0.9 -0.701" rotation="0 -80 0" scale="30 30 30" physx-body="type: static; emitCollisionEvents: true" v-if="pizzaBox"></a-entity>

      <a-box width="1" height="1" depth="0.160" position="-2.79919 0.45957 -0.74779" geometry="height: 0.92; depth: 1.02" physx-body="type: static" visible="false"></a-box>
      <a-entity gltf-model="assets/table.glb" position="-1.93414 0.28 -0.82578" rotation="0 90 0" scale="0.5 1.16 0.94" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#table" position="0.122 0.280 2.3" rotation="0 0 0" scale="1.16 1.16 1.16" physx-body="type: static"></a-entity>
      <a-entity id="paper" gltf-model="#paper" position="0 0.920 1.095" scale="0.04 0.04 0.04" rotation="0 90 0">
      </a-entity>
      <a-text id="list" rotation="-90 180 5" position="0.136 0.928 1.064" color="black" scale="0.15 0.15 0.15" random-list></a-text> 

      <a-cylinder id="crustBox" physx-body="type: static; emitCollisionEvents: true"
        @contactbegin="evt => detectObject(evt)"
        @contactend="evt => detectObjectLeaving(evt)" geometry="primitive: cylinder; height: 0.1; radius: 0.15" position="0.729 0.9 1.076"
        material="visible: false;" > 
      </a-cylinder>

      <a-entity id="pizzaBox" gltf-model="#box" position=" 3.3 1.2 -0.7" scale="0.0025 0.0025 0.0025" v-if="pizzaBox"
      physx-body="type: dynamic; emitCollisionEvents: true" @contactbegin="evt => delivered(evt)" physx-grabbable rotation="0 90 0">
      </a-entity>

      <!-- Murs -->
      <a-entity geometry="depth: 50; width: 50" position="0 -0.48574 1" visible="false"></a-entity>
      <a-entity geometry="depth: 20; width: 20" position="0 1.90484 2.29456" visible="false" rotation="90 0 0" physx-body="type: static"></a-entity>
      <a-entity geometry="depth: 20; width: 20" position="0 1.90484 -2.92705" visible="false" rotation="90 0 0" physx-body="type: static"></a-entity>
      <a-entity geometry="depth: 20; width: 20" position="4.21277 1.90484 -2.92705" visible="false" rotation="90 90 0" physx-body="type: static" ></a-entity>
      <a-entity geometry="depth: 20; width: 20" position="-4.00457 1.90484 -2.92705" visible="false" rotation="90 90 0" physx-body="type: static" ></a-entity>

       <!-- <a-box width="0.3" height="0.3" depth="0.3" material="visible: false;" geometry="width: 0.4; height: 0.06; depth: 0.07" 
          position="0.72989 0.91814 1.28404" physx-body="type: static; emitCollisionEvents: true"
        @contactbegin="evt => hit(evt)"
        @contactend="evt => unhit(evt)" class="bords" ></a-box>
        <a-box width="0.3" height="0.3" depth="0.3" material="visible: false;" geometry="width: 0.4; height: 0.06; depth: 0.07" 
          position="0.72989 0.91814 0.87039" physx-body="type: static; emitCollisionEvents: true"
        @contactbegin="evt => hit(evt)"
        @contactend="evt => unhit(evt)" class="bords"></a-box>
        <a-box width="0.3" height="0.3" 
          depth="0.3" material="visible: false;" geometry="width: 0.4; height: 0.06; depth: 0.07" position="0.94359 0.91814 1.10126" rotation="0 90 0"
          physx-body="type: static; emitCollisionEvents: true"
        @contactbegin="evt => hit(evt)"
        @contactend="evt => unhit(evt)" class="bords"></a-box>
        <a-box width="0.3" height="0.3" depth="0.3" material="visible: false;" geometry="width: 0.4; height: 0.06; depth: 0.07" position="0.51959 0.91814 1.10126" 
          rotation="0 90 0" physx-body="type: static; emitCollisionEvents: true"
          @contactbegin="evt => hit(evt)"
          @contactend="evt => unhit(evt)" class="bords"></a-box> -->
      
      <a-entity gltf-model="#crust" position="0.730 0.920 1.080" rotation="0 -180 0" scale="3.9 3.9 3.9" ref="crustElement"
      :visible="countdown > 0"></a-entity>

      <!-- pepperoni -->

      <a-entity gltf-model="#bowl" position="-0.62 1.04 1.51" scale="0.15 0.15 0.15"></a-entity>
      <a-entity gltf-model="#pPepperonis" position="-0.517 0.980 1.448" scale="5 5 5"></a-entity>
      <a-entity gltf-model="#pPepperonis" position="-0.53 0.970 1.496" scale="5 5 5" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pPepperonis" position="-0.535 0.951 1.447" scale="5 5 5" physx-body="type: static"></a-entity>
      <a-entity id="Pepperonis" physx-body="type: dynamic; emitCollisionEvents: true" physx-grabbable class="ingredients">
      <a-entity gltf-model="#pepperonis" position="-0.6 1 1.5" scale="3 3 3" ></a-entity>
      </a-entity>

      <!-- poivrons -->

      <a-entity gltf-model="#bowl" position="-0.97 1.04 1.534" scale="0.15 0.15 0.15"></a-entity>
      <a-entity gltf-model="#pPeppers" position="-0.960 0.950 1.461" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pPeppers" position="-1.003 0.980 1.417" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pPeppers" position="-1.057 0.993 1.496" rotation="0 90 0" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pPeppers" position="-0.968 0.951 1.447" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity id="Peppers" physx-body="type: dynamic; emitCollisionEvents: true" physx-grabbable class="ingredients">
      <a-entity gltf-model="#peppers" position="-0.97 1 1.5" scale="3 3 3"  rotation="0 90 0"></a-entity>
      </a-entity>


      <!-- olives -->

      <a-entity gltf-model="#bowl" position="-0.796 1.04 1.148" scale="0.15 0.15 0.15"></a-entity>
      <a-entity gltf-model="#pOlives" position="-0.767 0.950 1.262" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pOlives" position="-0.787 0.954 1.232" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pOlives" position="-0.741 0.97 1.163" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pOlives" position="-0.761 0.951 1.164" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity id="Olives" physx-body="type: dynamic; emitCollisionEvents: true" physx-grabbable class="ingredients">
      <a-entity gltf-model="#olives" position="-0.79 1 1.12" scale="3 3 3" ></a-entity>
      </a-entity>

      <!-- oignons -->
      <a-entity gltf-model="#bowl" position="-0.58 1.04 0.766" scale="0.15 0.15 0.15"></a-entity>
      <a-entity gltf-model="#pOnions" position="-0.57 0.94 0.8" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pOnions" position="-0.543 0.97 0.827" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pOnions" position="-0.57 0.95 0.762" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pOnions" position="-0.526 0.962 0.805" scale="6 6 6" physx-body="type: static"></a-entity>

      <a-entity id="Onions" physx-body="type: dynamic; emitCollisionEvents: true" physx-grabbable class="ingredients">
      <a-entity gltf-model="#onions" position="-0.58 1 0.78" scale="3 3 3" ></a-entity>
      </a-entity>

      <!-- champignons -->
      <a-entity gltf-model="#bowl" position="-0.96 1.04 0.808" scale="0.15 0.15 0.15"></a-entity>
      <a-entity gltf-model="#pMushrooms" position="-0.955 0.873 0.8" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pMushrooms" position="-0.940 0.896 0.760" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pMushrooms" position="-0.937 0.887 0.822" scale="6 6 6" physx-body="type: static"></a-entity>
      <a-entity gltf-model="#pMushrooms" position="-0.955 0.9 0.829" scale="6 6 6" physx-body="type: static"></a-entity>

      <a-entity id="Mushrooms" physx-body="type: dynamic; emitCollisionEvents: true" physx-grabbable class="ingredients" position="-0.950 1 0.772">
      <a-entity gltf-model="#mushrooms"  scale="3 3 3"></a-entity>
      </a-entity>

    </template>

    <TheCameraRig />
  </a-scene>
</template>