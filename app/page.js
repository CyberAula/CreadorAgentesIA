'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import nextConfig from '../next.config';
import urljoin from 'url-join';
import Header from "/components/Header";
import AssistantCard from '/components/AssistantCard';
import Toast from "/components/Toast"; // 👈 Toast global aquí!
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const basePath = nextConfig.basePath || '';

function Home() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const fetchData = async () => {
    const url = urljoin(basePath, '/api/assistants');
    const response = await fetch(url);
    const data = await response.json();
    if (data != undefined) {
      setAssistants(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);
  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-screen w-screen bg-myBg">

          <img src={`${basePath}/loading_.gif`} height={200} width={200} alt="loading" />
        </div>
      ) : (
        <main className="flex min-h-screen flex-col bg-myBg">
          <Header />
          <div className="flex flex-col justify-between md:items-center mx-4 my-4 md:mx-10 md:my-5 md:flex-row mt-[7rem]">
              <h2 className="text-xl md:text-2xl text-text font-semibold">Your active assistants</h2>
              <Link href="/assistant/new" className="flex mt-[3rem] md:mt-0 justify-center">
                <button className="buttontertiary flex gap-2 items-center">
                  <FontAwesomeIcon icon={faPlus} />
                  Create new assistant
                </button>
              </Link>
          </div>
          <div className="w-4/5 px-2 md:px-8 py-6 flex flex-col gap-5 text-text self-center justify-space-around items-center md:items-start">
            

            <div className="flex flex-wrap gap-4 max-w-max items-center">
              {assistants.map((assistant) => (
                <AssistantCard
                  key={assistant.id}
                  assistant={assistant}
                  onDelete={() => {
                    setAssistants(prev => prev.filter(a => a.id !== assistant.id));
                  }}
                  onShowToast={() => setShowToast(true)}
                />
              ))}


            </div>
          </div>
        </main>
      )}

      {/* Toast Global */}
      {showToast && (
        <Toast
        message="Assistant deleted successfully!"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
      
      )}
    </div>
  );
}

export default Home;
