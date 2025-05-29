import Link from 'next/link'; // Asegúrate de importar Link si lo vas a usar dentro del componente

const AssistantCard = ({ assistant }) => {
  // Aquí definimos las props que el componente esperará recibir
  // En este caso, esperamos un objeto 'assistant' con 'id' y 'name'

  return (
    <Link key={assistant.id} href={"/assistant/" + assistant.id}>
      <div className=" p-6 flex flex-col gap-6 items-center rounded-lg h-fit min-w-[20rem] max-w-xl cursor-pointer">
        <div className=" rounded-full bg-slate-500 h-2 w-2" />
        <div className=" flex flex-col">
            <img className="w-16 h-16 rounded-full" src="https://www.diariodepontevedra.es/asset/thumbnail,1280,720,center,center/media/diariodepontevedra/images/2017/07/17/cristobal_colon.jpg"/> 
            <div className=" text-text font-medium">{assistant.name}</div>
        </div>
        <p>Descripción</p>
        <div className="botones flex gap-2">
          <button className="buttonprimary">Edit</button>
          <button className="buttonprimary">Share</button>
          <button className="buttonsecondary">Delete</button>
        </div>              
    </div>

    </Link>
  );
};

export default AssistantCard;