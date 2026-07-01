import { createDit } from "../api/ditApi";
import DitForm from "../components/DitForm";

function DitCreation() {
  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        <div>
          <DitForm
            mode="create"
            onSubmitDit={async (data) => {
              await createDit(data);
            }}
          ></DitForm>
        </div>
      </div>
    </div>
  );
}

export default DitCreation;
