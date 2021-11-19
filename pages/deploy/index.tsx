import { useSnapshot } from "valtio";
import Container from "../../components/Container";
import { state } from "../../state";

const Deploy = () => {
  const snap = useSnapshot(state);
  return (
    <Container>This will be the deploy page {JSON.stringify(snap)}</Container>
  );
};

export default Deploy;
