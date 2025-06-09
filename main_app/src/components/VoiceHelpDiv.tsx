import VoiceHelp from "./VoiceHelp";

const VoiceHelpDiv = ({ text }) => (
  <div className="absolute bottom-6 left-6">
    <VoiceHelp text={text} />
  </div>
);

export default VoiceHelpDiv;