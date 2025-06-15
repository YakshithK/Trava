
import VoiceHelp from "./VoiceHelp";

const VoiceHelpDiv = ({ text }) => (
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
    <VoiceHelp text={text} />
  </div>
);

export default VoiceHelpDiv;
