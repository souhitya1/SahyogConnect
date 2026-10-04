import { useParams } from "react-router-dom";
function labourDetail(){
  const {id} = useParams();
  return(
    <h2>Labourer id: {id}</h2>
  )
}
export default labourDetail;