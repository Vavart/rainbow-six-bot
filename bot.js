/**********************************************************
Initialisation et démarrage du bot
***********************************************************/

const Discord = require('discord.js');
const bot = new Discord.Client();

// Token
bot.login(/* TOKEN */);

// Fonction qui s'éxécute quand le bot est prêt
bot.on('ready', readyDiscord);
function readyDiscord() {
  console.log("J'suis prêt mon grand");
}

/**********************************************************
Récupération d'un nombre entier aléatoire
***********************************************************/

// On renvoie un entier aléatoire entre une valeur min (incluse)
// et une valeur max (incluse).
// Attention : si on utilisait Math.round(), on aurait une distribution
// non uniforme !
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}

/**********************************************************
Parties personnalisées
***********************************************************/
/*                                  //
  !!! VARIABLES GLOBALES DU PROG !!!
*/                                  //

// Tableau qui va contenir les joueurs
let arr = [];

// Création de deux tableaux, une pour l'équipe 1 et une autre pour l'équipe 2
// On crée une sauvegarde du tableau de joueurs (au cas-où)
let arr_team1 = [];
let arr_team2 = [];
let arr_total = arr;

// Logo du bot
const logoBot = 'https://cdn.discordapp.com/attachments/797935531278336030/797935589756108841/Vavart.png'

// Sert au futur split
let partie_cree = false;

// Fonction destinée à la création de la partie personnalisée
function PartiePerso(msg) {

  // Initialisation des équipes
  // --> A chaque appel on recréé une partie (et on ajoute pas à la précédente)
  arr = [];
  arr_team1 = [];
  arr_team2 = [];
  arr_total = arr;


  // Récupération du XvsX
  let commande = msg.content.substring(4,8);
  let mode_jeu = commande.split('vs');

  // Conversion en nombre
  // team_ 1 : nb de personnes dans l'équipe 1
  let team_1 = parseInt(mode_jeu[0],10);
  let team_2 = parseInt(mode_jeu[1],10);

  // Vérification des conditions de partie
  // Si on rentre un 0vsX ou Xvs0
  if ((mode_jeu[0] == 0) || (mode_jeu[1] == 0))
  {

    const embedCommandError = new Discord.MessageEmbed()
      .setTitle('Le bot indique :')
      .setThumbnail(logoBot)
      .setColor('#FDD95E')
      .addFields(
        {
          name: "Commande inconne",
          value: ' Il faut minimum un adversaire en face !',
        },
      )

    return msg.channel.send(embedCommandError);
  }

  if ((mode_jeu.length == 0) || (mode_jeu.length == 1) || (mode_jeu[0] > 5) || (mode_jeu[1] > 5) || (mode_jeu[0] < 0) || (mode_jeu[1] < 0))
  {

    const embedCommandError = new Discord.MessageEmbed()
      .setTitle('Le bot indique :')
      .setThumbnail(logoBot)
      .setColor('#FDD95E')
      .addFields(
        {
          name: "Commande inconne",
          value: ' Assure toi de la forme : `!pp XvsX` !',
        },
      )

    return msg.channel.send(embedCommandError);
  }

  // Récupération du salon vocal
  let chanVocal = bot.channels.cache.get("620227752393703464");

  // On récupère les membres du channel vocal ...
  let membres = chanVocal.members;

  // ... et pour chacun d'entre eux, on les ajoute à ce tableau
  for (const[memberID, member] of membres) {
    arr.push(member.user.username);
  }

  // Cas si le nombre de personnes en vocal est supérieur au mode de jeu demandé
  if (team_1+team_2 != arr.length) {

    const embedPersoError = new Discord.MessageEmbed()
      .setTitle('Le bot indique :')
      .setThumbnail(logoBot)
      .setColor('#FDD95E')
      .addFields(
        {
          name: "Il y a trop ou pas assez de joueurs pour le mode demandé",
          value: `Vous êtes ${arr.length} pour un ${commande} !`,
        },
      )

    return msg.channel.send(embedPersoError);
  }

  // On remplit l'équipe 1
  for (let i = 0; i < team_1; i++) {

    // On prend un joueur aléatoire dans le tableaux des joueurs et on l'ajoute à l'équipe 1
    j = getRandomIntInclusive(0,arr.length-1);
    joueur = arr_total[j];
    arr_team1.push(joueur);

    // On supprime le joueur qui vient d'être ajouté à l'autre liste
    // "1 élément à partir de l'indice 'j' "
    arr_total.splice(j,1);
  }

  // On remplit l'équipe 2
  for (let i = 0; i < team_2; i++) {

    // On prend un joueur aléatoire dans le tableaux des joueurs et on l'ajoute à l'équipe 2
    j = getRandomIntInclusive(0,arr.length-1);
    joueur = arr_total[j];
    arr_team2.push(joueur);

    // On supprime le joueur qui vient d'être ajouté à l'autre liste
    // "1 élément à partir de l'indice 'j' "
    arr_total.splice(j,1);
  }


  // On créé le embed de présentation de partie
  const carte = getRandomMap();

  const embedPartie = new Discord.MessageEmbed()
    .setTitle(`Match ${commande} sur ${carte[0]}`)
    .setColor('#FDD95E')
    .setImage(carte[1])
    .addFields(
      {
        name: 'Équipe n°1 : ',
        value: arr_team1.join(" , "),
      },
      {
        name: 'Équipe n°2 : ',
        value: arr_team2.join(" , "),
      }
    )

  msg.channel.send(embedPartie);

  // Si tout ne bug pas d'ici là on créé une variable booléenne
  partie_cree = true;
  return

}

/**********************************************************
Split des équipes dans les salons
***********************************************************/

function PartiePersoSplit(msg) {

  // Si la partie n'est pas déjà créé au préalable
  if (!partie_cree) {

    const embedSplitError = new Discord.MessageEmbed()
      .setTitle('Le bot indique :')
      .setThumbnail(logoBot)
      .setColor('#FDD95E')
      .addFields(
        {
          name: "Impossible, il faut d'abord créer une partie au préalable !",
          value: 'Lance une partie perso avec !pp XvsX',
        },
      )

    return msg.channel.send(embedSplitError);
  }

  // Si la partie a bien été créée au préalable...
  else {

    // Récupération du salon vocal ("R6-1")
    let chanVocal = bot.channels.cache.get("620227752393703464");
    // On récupère les membres du channel vocal ...
    let membres = chanVocal.members;

    // ... on va pouvoir move les membres
    for (const [memberID, member] of membres) {
      if (arr_team1.includes(member.user.username)) {
        member.voice.setChannel('767462900041515059');
      }

      else if (arr_team2.includes(member.user.username)) {
        member.voice.setChannel('767463009811169333');
      }

      else {
        console.log(`L'utilsateur ${member.user.username} n'as pas pu être déplacé`);
      }
    }

    const embedSplit = new Discord.MessageEmbed()
      .setTitle('Le bot indique :')
      .setThumbnail(logoBot)
      .setColor('#FDD95E')
      .addFields(
        {
          name: 'Les joueurs ont bien été déplacés !',
          value: 'GL HF !',
        },
      )
    return msg.channel.send(embedSplit);

  }
}

/**********************************************************
Fin de partie - Déplacement des joueurs dans un même salon
***********************************************************/

function PartiePersoFinie(msg) {

  // Si la partie n'est pas déjà créé au préalable
  if (!partie_cree) {

    const embedSplitError = new Discord.MessageEmbed()
      .setTitle('Le bot indique :')
      .setThumbnail(logoBot)
      .setColor('#FDD95E')
      .addFields(
        {
          name: "Impossible, il faut d'abord créer une partie au préalable !",
          value: 'Lance une partie perso avec !pp XvsX',
        },
      )

    return msg.channel.send(embedSplitError);
  }

  // Récupération des salons vocaux ("R6-Perso-1" / "R6-Perso-2") et des membres des salons
  let chanVocalPerso1 = bot.channels.cache.get("767462900041515059");
  let membres1 = chanVocalPerso1.members;

  let chanVocalPerso2 = bot.channels.cache.get("767463009811169333");
  let membres2 = chanVocalPerso2.members;

  for (const [memberID, member] of membres1) {
    member.voice.setChannel("620227752393703464");
  }
  for (const [memberID, member] of membres2) {
    member.voice.setChannel("620227752393703464");
  }

  const embedEnd = new Discord.MessageEmbed()
    .setTitle('Le bot indique :')
    .setThumbnail(logoBot)
    .setColor('#FDD95E')
    .addFields(
      {
        name: "Partie terminée !",
        value: 'Retour des joueurs dans le salon vocal R6-1',
      },
    )

  return msg.channel.send(embedEnd);
}

/**********************************************************
Récupération d'un carte aléatoire
***********************************************************/

function getRandomMap() {
  maps = ["Maison","Oregon","Club House","Consulat","Banque","Canal","Chalet","Café Dostoyevsky","Frontière","Gratte-Ciel","Littoral","Parc d'attractions","Villa"];
  // Les logos des maps dans le même ordre que la liste ci-dessus
  logoMaps = [

    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/28OaEZAY3stNFr0wSvW9MB/c7acc97d43486349763acab3c1564414/r6-maps-house.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/Z9a0gU7iR0vfcbXtoJUOW/42ad6aabbd189fbcd74c497627f1624e/r6-maps-oregon.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1vCw5eD2XzxZlv6Au1gtui/a173a37999379b65dad7b37a77c24498/r6-maps-clubhouse.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6PR2sBla9E6TNurVUfJ0mc/860cab16eb1d4cd27ea356a1c3fe9591/r6-maps-consulate.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6ilgtuzucX7hEu2MvjhRtp/e399b773b495f9249b42a82006259109/r6-maps-bank.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4VHR8uZRGkHqvtZxtmibtc/da988c2cab37f1cb186535fc9ba40bea/r6-maps-kanal.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/Km3ZJUM7ZMVbGsi6gad5Y/c48162371342d9f15386c77a3766315b/r6-maps-chalet.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2nIuPSHvbM57TK90VSwBEm/70144ada56cf1ba72103aeb4ece9ed1a/r6-maps-kafe.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4hqsrL3cokFqedkfjiEaGf/10bee7874cecf7410b035973f0ed5da2/r6-maps-border.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7vblsbhmSPLsI3pQJ5Dqx9/f213af09981f5c8ec9b71fb0c3f9dcdd/r6-maps-skyscraper.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5GfAQ3pXCJnDqiqaDH3Zic/2a491e0c4c184c28a88792d85279e551/r6-maps-coastline.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2immPCOZj6tTHMM9zeBg5B/cf09c9c75bc2e70dd38ebf0a12bdb9a2/r6-maps-themepark.jpg',
    'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/Io6dxNeHbCbJoF9WLJf9s/ebf89b009affba37df84dcf1934c74e0/r6-maps-villa.jpg'

  ];
  i = getRandomIntInclusive(0,maps.length-1);
  return [maps[i],logoMaps[i]];

}

/**********************************************************
Sélection d'un agent aléatoire
***********************************************************/

// L'ordre entre les agents et les images
const att_op = [

  "Zero",
  "Ace",
  "Iana",
  "Kali",
  "Amaru",
  "NØkk",
  "Gridlock",
  "Nomad",
  "Maverick",
  "Lion",
  "Finka",
  "Dokkaebi",
  "Zofia",
  "Ying",
  "Jackal",
  "Hibana",
  "Capitão",
  "Blackbeard",
  "Buck",
  "Sledge",
  "Thatcher",
  "Ash",
  "Thermite",
  "Montagne",
  "Twitch",
  "Blitz",
  "IQ",
  "Fuze",
  "Glaz"


  ];

const att_op_pics = [

  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4ZbzOZt1Sur77RZTFwYVJ4/98da1c4251466ee1af68e321d81cc276/r6s-operators-badge-zero.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/dgG7GmXY1HgfeEE2gI1H9/dece6d768f1d3682709815e8f645b94c/R6_live_Y5S2_IMG_Ace_Icon.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6deSi1vse5iJTkErFksrGq/5b116e90bae5c039e4db5e6150c33cd2/r6s-operator-badge-iana.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6r1hk1EunQirF1IcY4TG8T/fa1e41a93eb39fb33acb3df101f5e748/r6-operators-badge-kali_358313.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2K1uxROLvHGxOIOMpNRFeU/0af1a40bfd8b371a6bb48f72fc15f6cb/R6-emberrise-badge-amaru.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2qfSHHTdCRVhx9EWycVDNr/f15412144563ca3d4c8c506fac4156f9/R6-operators-badge-nokk.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5LIyheUROsdMDkX6o0zh6R/1467d4c76aed789fe41745c685d7a2a9/R6-operators-badge-gridlock.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/UxfU1gJDoZGDrzT3iBsIp/b70baeb4d8b28bb6b3def89395ec8078/R6-operators-badge-nomad.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/3DXiYgVT71qGscYmFMgayj/2fc2b4190c2e1b363d688bd5aaeba0a3/R6-operators-badge-maverick.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/3gfdjXFezusaerCakMpfQ2/bd8cdf42d4bbd74c0474b60452895912/R6-operators-badge-lion.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6CzQHWePD3Mi8HE5bdx5ic/0904e2769ccaf1652e4b4f1e26ccd873/R6-operators-badge-finka.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/aoQeHLohcuqvubBoyrzsM/4e9b31c9d27e8163eceb6f9d412b0bf4/R6-operators-badge-dokkaebi.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1k09nbCCu2avlIWpK3cJz9/81ecd6ca4c169e2998b3ac4559677f18/R6-operators-badge-zofia.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6ZVB1OJxNgs0pR0Fd7Kzt0/7a06ed685b259b2d5985b952adbc35ac/R6-operators-badge-ying.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/28k7LKWK70lxib7CimPJaZ/2e143fd674b4cf9764e2a462e6b02d45/R6-operators-badge-jackal.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1TSA4pMR58vgfrEai69REl/6b30b0a90eb1806ecc28aede188a1b88/R6-operators-badge-hibana.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/73R4IrWJyn0xdkJ0fjOODA/39a289b513fa310ec67abd74f6db4f4e/R6-operators-badge-capitao.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4BTbmcs1EtoUbnpk5Am22Y/e6f8243bdedf981379905587cbde1ce0/R6-operators-badge-blackbeard.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2oZZBEZzVLFpRY7Mp85MWq/1eb30d5edca3b4e24cd4686ddcbbc8fc/R6-operators-badge-buck.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4lgK1mOTVAoBhoj5qjYuyd/5f7cb5bcff5e4853f3f1e31844740feb/R6-operators-badge-sledge.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5QGPM6l25ybaINnaIaLgvm/d018abc75d44758d666ad6bea0a38a9b/r6-operators-list-thatcher.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/58Y4Q2x7msL8uQUoiA7LGM/222950b043bf0f9b944f9857820e54ec/ash_badge_196406.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6tow5mqLao5TrJVL52csSc/38c473ef628e4c2d4614f8fd4aa37101/R6-operators-badge-thermite.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7qWONT0mrNYtUZVTVVT8Yj/4e7275e2f6bdd33e71b0803a3bb4f2f1/R6-operators-badge-montagne.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/3YgCpOSM2R4SDgExstxm7P/755baebda451ac4abc9336c2d15951f8/R6-operators-badge-twitch.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2YTGfm1Df9PtldLcGodcTV/450344531dbeac8ba89bcdf88bfd436d/R6-operators-badge-blitz.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4xnVj2iZB8Otchiw7j69UO/e13e484bf4a182b01671e22ac2d0b5a3/R6-operators-badge-iq.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1wkdQ0viuTEguji14qXMJG/fa54384ae739bdf51f7337214af9f77c/R6-operators-badge-fuze.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5UAZVgyOutPh6bLTV3fGXf/d798dc243c96e34b04957badb0a36892/R6-operators-badge-glaz.png"

];

const def_op = [

  "Aruni",
  "Melusi",
  "Oryx",
  "Wamai",
  "Goyo",
  "Warden",
  "Mozzie",
  "Kaid",
  "Clash",
  "Maestro",
  "Alibi",
  "Vigil",
  "Ela",
  "Lesion",
  "Mira",
  "Echo",
  "Caveira",
  "Valkyrie",
  "Frost",
  "Mute",
  "Smoke",
  "Castle",
  "Pulse",
  "Doc",
  "Rook",
  "Jäger",
  "Bandit",
  "Tachanka",
  "Kapkan"

  ];

const def_op_pics = [

  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5rOLCYQOh5HH0Nv6NHe38H/9b0328e497113d55ecb88cc2b090cbcd/r6s-operators-badge-aruni.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/74H52a9GMql8wamIy6WqH5/dc61748984f94d604875a40cf4befdd9/R6_live_Y5S2_IMG_Melusi_Icon_Detailed.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7mLA8GY9ZKlUfDXrfo9Nek/730d5ca033d97c9b18a3c1b9ffbebfbf/r6s-operator-badge-oryx.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1vQZ4WsAjhc6M7qNOS4ahQ/807730f380b5e9b0ec6709b88e8074e0/r6-operators-badge-wamai_358314.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6AAY4FZt5piHdabOdDokE4/177f9238513adc72841cb23e7d2fd3c8/R6-operators-badge-goyo.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/hx1Ljf1qIWbjpgCNmfJbu/77e24950472bef2666d22c728973b6f8/R6-operators-badge-warden.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/15hUu2PsypX2c1LIJFQNUT/267e38eb82e2a747b889640eb29e3a15/r6-operators-badge-mozzie_343389.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5Qblb1ZqAqkN3Wa0Qw5qBq/576cca3c0f670e004465d8eda65ecb7f/R6-operators-badge-kaid.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7G4lGl5HPLFTTUdcZW8UOK/9a11e57e156db1650c4dbc9f4109dc97/R6-operators-badge-clash.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/XK43imgD0tc0xrk0tgTCQ/845af1eae273f223b8899057a4b435c8/R6-operators-badge-maestro.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/3DgGV3hETnXiEvVFOYZrbm/b0de6494b25e881ebac95aeb7ca0f62b/R6-operators-badge-alibi.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/56A3hXhWZdwO623g3ejeku/51763bac488234b3c4cd6aa67139d267/R6-operators-badge-vigil.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7zbkJJWMCOj04DNhYDz994/6cfc0fe63eddfa79ba0aff35718cc9b7/R6-operators-badge-ela.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2CWYSySnPAhsOHdq2OLSjv/26a2e014440b0c69660de7e948cb4e65/R6-operators-badge-lesion.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/u1KR6aogjLncAtaVOciTc/8e919eb8b6671924ae5e069d10054ebd/R6-operators-badge-mira.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/3MRqAdUybJ7GR9gX4wPAI4/4243abf46814f68d36e6f09f8d0b39a3/R6-operators-badge-echo.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4H1dOkcdZIKblKkAWjD390/2bbe883bef92d4264c0a63e47528e118/R6-operators-badge-caveira.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/44qXJmZmAwaD4w44JnPuOx/a93fd99e815b7189dd3a2297e48d0328/R6-operators-badge-valkyrie.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1OWFtfiEXleLSENciCSQQR/6c8b928c3460a58d3d4d1112ddd684f9/R6-operators-badge-frost.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/3exeHnxH1tmUmQTequWRKa/7ecfa4800700046f384bc69728e538fb/R6-operators-badge-mute.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/6mOMxoc3t27R9Gr9wFtt6T/8994acf3c0c803727eefe1325dafc149/R6-operators-badge-smoke.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/kzznLctjOsXJZAg0F2HPB/a450d8d1be64d29162879674c44a78fa/R6-operators-badge-castle.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/ChAeJzdmwxuvhZTrV81rK/42208264de7b891de2e66515970f3814/R6-operators-badge-pulse.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/71Nl3v0LqHyo9eXV6xTFQd/fa3f92f0fc0b526437da3eb0aaedebf1/R6-operators-badge-doc.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/3Yk1noMd9re0RLlrXJSWtR/fc9b5b7bbe72d03d2fcbbf076b1854fb/R6-operators-badge-rook.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/1cCvTmKwnnovVmpZmDyPkA/c4a256ef4907d1c435720dcccb1f1150/R6-operators-badge-jager.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4Vasjq82J1TNjNE38J7LmV/fd29f8c283c1a08f1a03e7123f64d1e8/R6-operators-badge-bandit.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/7hpI2mcmvyjC2vG6ieltLo/4487e150046e98afd69a84bfe3bcf995/R6-operators-badge-tachanka.png",
  "https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/797q7C5YA89eFqw4RB40ka/7b9d4b911ef04ecc94ca6f60d76c79d6/R6-operators-badge-kapkan.png"



  ];


function Agents (msg) {

  // Création de deux indices pour parcourir aléatoirement les tableaux des agents (attaque et défense)
  const r_index_att = Math.floor(Math.random() * att_op.length);
  const r_index_def = Math.floor(Math.random() * def_op.length);

  let randomAttOp = att_op[r_index_att];
  let randomAttOp_pic = att_op_pics[r_index_att];

  let randomDefOp = def_op[r_index_def];
  let randomDefOp_pic = def_op_pics[r_index_def];


  const embedAgentAtt = new Discord.MessageEmbed()
    .setTitle(`Respire ${msg.author.username}! Vavart a choisi pour toi!`)
    .setThumbnail(randomAttOp_pic)
    .setColor('#FDD95E')
    .addFields(
      {
        name: `Tu joueras ${randomAttOp} en attaque! `,
        value: "Ne t'inquiète pas ça va bien se passer :wink:",
      }
    )


  const embedAgentDef = new Discord.MessageEmbed()
    .setTitle(`Respire ${msg.author.username}! Vavart a choisi pour toi!`)
    .setThumbnail(randomDefOp_pic)
    .setColor('#FDD95E')
    .addFields(
      {
        name: `Tu joueras ${randomDefOp} en défense! `,
        value: "Ne t'inquiète pas ça va bien se passer :wink:",
      }
    )


  // On renvoir deux agents (1 attaque / 1 défense) au harsard
  msg.channel.send(embedAgentAtt);
  msg.channel.send(embedAgentDef);

  return
}


/**********************************************************
Réponses aléatoires
***********************************************************/
function RandomAnswers(msg) {

  // Stockage des réponses
  const replies = [
    "J'ai pas ton temps mamèèène",
    "Pdtr t ki",
    "Nar nar shetan",
    "Moi je n'annonce pas Monsieur, j'énonce !",
    "J'aime me beurrer la biscotte",
    "Fun fact : Eitta s'appelle en réalité Eittia",
    "Y'a pas à tortiller du cul pour ch*er droit",
    "T'as ch*ié dans la colle mamèène",
    "T'es mauvaiiis Jack!",
    "C'est à s'en taper le cul par terre",
    "Un grand homme a dis un jour : Écoute ton coeur",
    "J'ai le gosier sec mamèène",
    "J'peux jouer comme un singe ??",
    "Akikikikikikikikiki !",
    "Tu throw putaiiin!",
    "Imagine je meurs, nan j'déconne, mais imagine",
    "True fact : Baptiste gagne TOUJOURS les 2-2",
    "La légende raconte que Scorn main Kapkan",
    "Je sais pas si tu savais mais j'adore l'humour!",
    "Tout ce qui est drôle sah j'adore!"
  ];

  // Création d'un indice pour parcourir aléatoirement le tableau 'replies'
  const r_index = Math.floor(Math.random() * replies.length);

  // On renvoir une réponse au hasard
  return msg.channel.send(replies[r_index]);

}

/**********************************************************
Message d'appel !
***********************************************************/

function Akikiki (msg) {

  roleId = '640645581647380501';

  const embedAkiki = new Discord.MessageEmbed()
    .setTitle("AKIKIKIKIKIKIKIKIKIKIKI !!!")
    .setThumbnail(logoBot)
    .setColor('#fd9e27')
    .addFields(
      {
        name: `Viendééé touus jouuuer !!! `,
        value: `<@&${roleId}> , RASSEMBLEMENT !`,
      }
    )

  // On envoie les messages dans le salon #blabla-r6

  msg.channel.send(embedAkiki);
  msg.channel.send(`>>> <@&${roleId}>`);
  return

}
/**********************************************************
Bulle d'info du bot
***********************************************************/

function Info (msg) {


  // Salons

  const blablaR6_ID = 638349829168300052;
  // ${msg.guild.channels.cache.get('638349829168300052').toString()}
  const screenR6_ID = 627219106294267905;
  // ${msg.guild.channels.cache.get('627219106294267905').toString()}
  const partieR6_ID = 790508119125786636;
  // ${msg.guild.channels.cache.get('790508119125786636').toString()}


  const embedInfo = new Discord.MessageEmbed()
    .setTitle('Liste de commandes actuelles et leurs salons dédiés')
    .setThumbnail(logoBot)
    .setColor('#FDD95E')
    .addFields(
      {
        name: "`!info`",
        value: `Disponible dans les salons ${msg.guild.channels.cache.get('638349829168300052').toString()} & ${msg.guild.channels.cache.get('790508119125786636').toString()} : Renvoie les commandes possibles du bot.`,
      },
      {
        name: "`!akikiki`",
        value: `Disponible dans ${msg.guild.channels.cache.get('638349829168300052').toString()} : Appel des joueurs R6 pour venir jouer!`,
      },
      {
        name: "`!cheh`",
        value: `Disponible dans les salons ${msg.guild.channels.cache.get('638349829168300052').toString()} & ${msg.guild.channels.cache.get('627219106294267905').toString()} : Renvoie le fameux gif.`,
      },
      {
        name: "`!agent`",
        value: `Disponible dans ${msg.guild.channels.cache.get('638349829168300052').toString()} : Le bot va retourner deux agents aléatoires, un en attaque et un en défense.`,
      },  

      {
        name: "///// **Commandes liées aux parties persos** /////",
        value: "On est avant tout une grande famille",
      },
    
      {
        name: "`!pp XvsX`",
        value: `Disponible dans ${msg.guild.channels.cache.get('790508119125786636').toString()} : Création de parties perso R6.`,
      },
      {
        name: "`!split`",
        value: `Disponible dans ${msg.guild.channels.cache.get('790508119125786636').toString()} : Quand la partie personnalisée est créée cette commande déplace les utilsateurs vers les salons vocaux R6-Perso 1 et R6-Perso 2.`,
      },
      {
        name: "`!end`",
        value: `Disponible dans ${msg.guild.channels.cache.get('790508119125786636').toString()}  : Quand la partie est finie, on bouge tous les utilsateurs de R6-Perso 1 et R6-Perso 2 vers le salon vocal général R6-1.`,
      },
      
    )

  return msg.channel.send(embedInfo);

}

/**********************************************************
Réactions aux messages / Commandes
***********************************************************/

// Évènement qui s'exécute dès que qqun parle dans le serveur
bot.on('message', gotMessage);

function gotMessage(msg) {

  // Partie Perso
  if (msg.channel.id == 790508119125786636 && msg.content.startsWith('!pp')) {
    PartiePerso(msg);
    msg.delete();
    return

  }

  // Maintenant on va s'intéresser à déplacer les membres directement dans les équipes
  if (msg.channel.id == 790508119125786636 && msg.content == '!split') {
    PartiePersoSplit(msg);
    msg.delete();
    return
  }

  // Fin de partie, on remet les joueurs dans un channel commum
  if (msg.channel.id == 790508119125786636 && msg.content == '!end') {
    PartiePersoFinie(msg);
    msg.delete();
    return
  }

  // Bulle d'infos
  if (((msg.channel.id == 638349829168300052) || ( msg.channel.id == 627219106294267905) || ( msg.channel.id == 791603762115903528)) && (msg.content.startsWith('!info'))) {
    Info(msg);
    msg.delete();
    return
  }


  // Renvoie une réponse aléatoire si le message contient "bot"
  if (msg.channel.id == 638349829168300052 && msg.content.includes("bot")) {
    RandomAnswers(msg);
    return

  }

  // Monologue d'otis
  if (msg.channel.id == 638349829168300052 && msg.content == "C'est une bonne situation ça, scribe ?") {
    msg.reply("Mais, vous savez, moi je ne crois pas qu'il y ait de bonne ou de mauvaise situation. Moi, si je devais résumer ma vie aujourd'hui avec vous, je dirais que c'est d'abord des rencontres, des gens qui m'ont tendu la main, peut-être à un moment où je ne pouvais pas, où j'étais seul chez moi. Et c'est assez curieux de se dire que les hasards, les rencontres forgent une destinée… Parce que quand on a le goût de la chose, quand on a le goût de la chose bien faite, le beau geste, parfois on ne trouve pas l'interlocuteur en face, je dirais, le miroir qui vous aide à avancer. Alors ce n'est pas mon cas, comme je le disais là, puisque moi au contraire, j'ai pu ; et je dis merci à la vie, je lui dis merci, je chante la vie, je danse la vie… Je ne suis qu'amour ! Et finalement, quand beaucoup de gens aujourd'hui me disent : « Mais comment fais-tu pour avoir cette humanité ? » Eh bien je leur réponds très simplement, je leur dis que c'est ce goût de l'amour, ce goût donc qui m'a poussé aujourd'hui à entreprendre une construction mécanique, mais demain, qui sait, peut-être simplement à me mettre au service de la communauté, à faire le don, le don de soi…");
    return
  }

  // !cheh commande
  if (((msg.channel.id == 638349829168300052) || ( msg.channel.id == 627219106294267905)) && (msg.content.startsWith('!cheh'))) {
    msg.channel.send("https://media.discordapp.net/attachments/532876698409107477/779071455991562260/image0.gif");
    msg.delete();
    return
  }

  // !agent commande
  if ((msg.channel.id == 638349829168300052) && (msg.content.startsWith('!agent'))) {
    Agents(msg);
    msg.delete();
    return
  }

  // !akikiki commande
  if ((msg.channel.id == 638349829168300052) && (msg.content.startsWith('!akikiki'))) {
    Akikiki (msg);
    msg.delete();
    return
  }

}
