import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFolders } from "../../_queries/folders.query";
import { useDashboards } from "../../_queries/dashboards.query";
import Header from "../../components/Header";

function TextArt({ text, refProp }) {
  return (
    <pre
      ref={refProp}
    >
      {text}
    </pre>
  );
}

const islandFishingTextArt = "        .\n       \":\"\n     ___:____     |\"\\/\"|\n   ,'        `.    \\  /\n   |  O        \\___/  |\n ~^~^~^~^~^~^~^~^~^~^~^~^~";

export default function Error() {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const asciiRef = useRef(null); // <- create a ref for the ASCII art

  const { data: folders, isSuccess: foldersLoaded, isLoading: foldersLoading } = useFolders();
  const firstFolder = folders?.[0];
  const { data: dashboards, isSuccess: dashboardsLoaded } = useDashboards(firstFolder?.uid);

  useEffect(() => {
    if (!foldersLoaded || foldersLoading || redirecting) return;

    if (folders && folders.length > 0 && dashboardsLoaded) {
      setRedirecting(true);
      const firstFolder = folders[0];
      if (dashboards && dashboards.length > 0) {
        const firstDashboard = dashboards[0];
        navigate(`/folder/${firstFolder.uid}/dashboard/${firstDashboard.uid}`, { replace: true });
      } else {
        navigate(`/folder/${firstFolder.uid}`, { replace: true });
      }
    }
  }, [foldersLoaded, foldersLoading, folders, dashboards, dashboardsLoaded, navigate, redirecting]);

  // Override ASCII art font to monospace repeatedly
  useEffect(() => {
    const applyMonospace = () => {
      if (asciiRef.current) {
        asciiRef.current.style.setProperty("font-family", "monospace", "important");
        console.log("Monospace applied");
        return true;
      }
      return false;
    };
    if (applyMonospace()) return;
    const observer = new MutationObserver(() => {
      if (applyMonospace()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);


  if (foldersLoading || redirecting || (folders && folders.length > 0 && !dashboardsLoaded)) {
    return (
      <>
        <Header />
        <div className="bg-[#0c0d12] min-h-screen overflow-hidden">
          Loading...
        </div>
      </>
    );
  }

  return (

    <div className="h-screen bg-[#0c0d12] overflow-hidden">
      <Header />
      <div className="flex flex-col items-center justify-center mt-[18%]">
        <div className="mb-6 text-center text-white">
          You have no folders. Please contact the System Administrator.
        </div>

        <div className="whitespace-pre text-white">
          <TextArt
            text={islandFishingTextArt}
            refProp={asciiRef}
          />
        </div>
      </div>
    </div>
  );
}
