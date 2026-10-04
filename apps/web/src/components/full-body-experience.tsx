import FullBodyAnatomy from './full-body-anatomy';
export default async function FullBodyExperience() {
 const {heartBinding,myocardialInfarctionDraft}=await import('../lib/pathophysiology-draft');
 return <FullBodyAnatomy binding={heartBinding} scenario={myocardialInfarctionDraft}/>;
}
