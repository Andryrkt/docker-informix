import DossierDitTableWithView from "../components/DossierDitTableWithView";

function DossierDitList() {
  return (
    <div className="p-4 w-full  h-full">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-x-auto ">
        <DossierDitTableWithView></DossierDitTableWithView>
      </div>
    </div>
  );
}

export default DossierDitList;
