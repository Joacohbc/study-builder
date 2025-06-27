import { BrowserRouter } from 'react-router-dom';
import { useStudySets } from './contexts/useStudySets';
import AppLayout from './layout/AppLayout';

function App() {
    const {
        isLoading
    } = useStudySets();

    // Render loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
                <div className="animate-pulse flex flex-col items-center p-8">
                    <div className="w-12 h-12 bg-blue-500 rounded-full mb-4"></div>
                    <p className="mt-4 text-lg text-indigo-800 font-medium">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter basename="/study-builder">
            <AppLayout />
        </BrowserRouter>
    );
}

export default App;
