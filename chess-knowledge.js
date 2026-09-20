// Chesstochess — Chess knowledge layer
// Pure data + detection helpers. This is intentionally separate from the move engine.
// Future trainers can consume the same knowledge registry without changing chess legality.

const CHESS_KNOWLEDGE={
 openings:{
  "london-system":{
   name:"London System",
   type:"system",
   aliases:["London","London System","Pyramid setup"],
   side:"w",
   signature:{requiredMoves:["d4","Bf4","e3","c3"],optional:["Nf3","Bd3","Nbd2","O-O"]},
   ideas:["solid central structure","develop the c1 bishop before e3","prepare kingside castling","use the e5 outpost"],
   principles:["development","king safety","central control"]
  },
  "pyramid-opening":{
   name:"Pyramid Opening",
   type:"named system / informal name",
   aliases:["Pyramid Opening","Pyramid System"],
   note:"The name is used inconsistently. Some chess communities use it for the London-style pawn pyramid, while other sources use it for different move orders. The detector therefore stores it as an alias rather than assuming every pawn pyramid is the same opening.",
   variants:[
    {label:"London-style pyramid",signature:{requiredMoves:["d4","e3","c3"],supporting:["Bf4","Bd3"]}},
    {label:"c3-d4-e4-f3 setup",signature:{requiredMoves:["c3","d4","e4","f3"]}}
   ],
   ideas:["build a pawn pyramid","support the center","develop pieces around the structure"],
   principles:["central control","development"]
  },
  "italian-game":{
   name:"Italian Game",
   type:"opening",
   aliases:["Italian","Giuoco Piano"],
   signature:{requiredMoves:["e4","Nf3","Bc4"]},
   ideas:["rapid development","control the center","prepare castling"],
   principles:["development","king safety","central control"]
  },
  "ruy-lopez":{
   name:"Ruy Lopez",
   type:"opening",
   aliases:["Spanish Game","Ruy Lopez"],
   signature:{requiredMoves:["e4","Nf3","Bb5"]},
   ideas:["pressure the e5 pawn","develop with tempo","fight for the center"],
   principles:["development","central control"]
  },
  "sicilian-defense":{
   name:"Sicilian Defense",
   type:"defense",
   aliases:["Sicilian"],
   signature:{requiredMoves:["e4","c5"]},
   ideas:["asymmetrical central control","counterplay against e4"],
   principles:["central control","counterplay"]
  }
 },
 principles:{
  development:{name:"Development",description:"Bring minor pieces into useful squares and avoid repeated early moves with the same piece."},
  kingSafety:{name:"King safety",description:"Castle when appropriate and avoid unnecessary weakening of the king."},
  centralControl:{name:"Central control",description:"Contest the central squares with pawns and pieces."},
  pieceActivity:{name:"Piece activity",description:"Prefer active squares, open lines, and useful coordination."},
  tempo:{name:"Tempo",description:"Use moves that create threats or improve a piece while gaining time."},
  pawnStructure:{name:"Pawn structure",description:"Recognize chains, islands, breaks, weaknesses, and support formations."}
 },
 tactics:{
  fork:{name:"Fork",description:"One piece attacks two or more valuable targets."},
  pin:{name:"Pin",description:"A piece cannot move without exposing a more valuable piece or the king."},
  skewer:{name:"Skewer",description:"A valuable front piece is attacked and moving it exposes another target behind it."},
  discoveredAttack:{name:"Discovered attack",description:"Moving one piece reveals an attack from another piece."},
  discoveredCheck:{name:"Discovered check",description:"A discovered attack that gives check."},
  doubleCheck:{name:"Double check",description:"The king is attacked by two sources simultaneously."},
  deflection:{name:"Deflection",description:"Force a defender away from the square or piece it protects."},
  attraction:{name:"Attraction",description:"Lure a target onto a tactically vulnerable square."},
  clearance:{name:"Clearance",description:"Move a piece away to open a line or square for another piece."},
  zwischenzug:{name:"Zwischenzug",description:"Insert an intermediate forcing move before the expected recapture or response."},
  backRankMate:{name:"Back-rank mate",description:"A boxed-in king is mated along its back rank."},
  matingNet:{name:"Mating net",description:"A coordinated set of threats removes the king's escape squares."}
 },
 endgames:{
  opposition:{name:"Opposition",description:"Kings face each other with an odd number of squares between them, often deciding king access."},
  zugzwang:{name:"Zugzwang",description:"The obligation to move worsens a player's position."},
  ruleOfSquare:{name:"Rule of the square",description:"A king can catch a passed pawn when it can enter the pawn's square."},
  outsidePassedPawn:{name:"Outside passed pawn",description:"A passed pawn far from the main battle can distract the opposing king."}
 }
};

function knowledgeMoveAliases(){
 const aliases={};
 for(const group of Object.values(CHESS_KNOWLEDGE)){
  for(const item of Object.values(group)){
   if(!item.aliases)continue;
   for(const alias of item.aliases)aliases[alias.toLowerCase()]=item.name;
  }
 }
 return aliases;
}

function normalizeKnowledgeMove(move){
 return String(move||'').replace(/[+#?!]/g,'').trim();
}

function detectOpeningKnowledge(moveList){
 const moves=moveList.map(normalizeKnowledgeMove);
 const found=[];
 for(const [id,opening] of Object.entries(CHESS_KNOWLEDGE.openings)){
  if(opening.signature){
   const required=opening.signature.requiredMoves||[];
   if(required.every(move=>moves.includes(move)))found.push({id,name:opening.name,confidence:"pattern"});
  }
  if(opening.variants){
   for(const variant of opening.variants){
    const required=variant.signature?.requiredMoves||[];
    if(required.every(move=>moves.includes(move)))found.push({id,name:opening.name,variant:variant.label,confidence:"pattern"});
   }
  }
 }
 return found;
}

function getChessKnowledge(category,key){
 return CHESS_KNOWLEDGE[category]?.[key]||null;
}

window.ChessKnowledge={CHESS_KNOWLEDGE,knowledgeMoveAliases,normalizeKnowledgeMove,detectOpeningKnowledge,getChessKnowledge};
