export type GridContentRating='E'|'CHILD'|'TEEN'|'ADULT'|'GRAPHIC'|'RESTRICTED';
export type GridAgeBand='child'|'teen'|'adult';
export function canAccessContent(ageBand:GridAgeBand,rating:GridContentRating){
  if(rating==='E'||rating==='CHILD') return true;
  if(rating==='TEEN') return ageBand==='teen'||ageBand==='adult';
  return ageBand==='adult';
}
export function ratingLabel(rating:GridContentRating){return rating==='E'?'E · EVERYONE':rating==='CHILD'?'CHILD':rating;}
export function contentBlockedMessage(rating:GridContentRating){return 'This area is rated '+ratingLabel(rating)+' and your account cannot enter it.';}
