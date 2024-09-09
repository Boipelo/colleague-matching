import React, { useState } from 'react';
import { Plus, X, Save, Edit2 } from 'lucide-react';

const ColleagueEditor = ({ colleagues, onSave }) => {
  const [editingColleague, setEditingColleague] = useState(null);
  const [newColleague, setNewColleague] = useState({ name: '', photo: '', descriptions: [''] });

  const handleEdit = (colleague) => {
    setEditingColleague({
      ...colleague,
      descriptions: Array.isArray(colleague.descriptions) ? [...colleague.descriptions] : ['']
    });
  };

  const handleSave = () => {
    if (editingColleague) {
      onSave(editingColleague);
    } else {
      onSave(newColleague);
    }
    setEditingColleague(null);
    setNewColleague({ name: '', photo: '', descriptions: [''] });
  };

  const handlePhotoUpload = (e, isNew = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isNew) {
          setNewColleague(prev => ({ ...prev, photo: reader.result }));
        } else {
          setEditingColleague(prev => prev ? { ...prev, photo: reader.result } : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionChange = (index, value, isNew = false) => {
    const updateState = isNew ? setNewColleague : setEditingColleague;
    updateState(prev => {
      if (!prev) return null;
      const newDescriptions = [...(prev.descriptions || [])];
      newDescriptions[index] = value;
      return { ...prev, descriptions: newDescriptions };
    });
  };

  const addDescription = (isNew = false) => {
    const updateState = isNew ? setNewColleague : setEditingColleague;
    updateState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        descriptions: [...(prev.descriptions || []), '']
      };
    });
  };

  const removeDescription = (index, isNew = false) => {
    const updateState = isNew ? setNewColleague : setEditingColleague;
    updateState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        descriptions: (prev.descriptions || []).filter((_, i) => i !== index)
      };
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Colleague Editor</h2>
      {colleagues.map(colleague => (
        <div key={colleague.id} className="mb-2 p-2 border rounded flex justify-between items-center">
          <span>{colleague.name}</span>
          <button onClick={() => handleEdit(colleague)} className="text-blue-500">
            <Edit2 size={16} />
          </button>
        </div>
      ))}
      {editingColleague ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Edit Colleague</h3>
          <input
            type="text"
            value={editingColleague.name || ''}
            onChange={(e) => setEditingColleague(prev => prev ? { ...prev, name: e.target.value } : null)}
            className="mb-2 p-2 border rounded w-full"
            placeholder="Colleague Name"
          />
          <input 
            type="file" 
            onChange={(e) => handlePhotoUpload(e)}
            className="mb-2 w-full"
          />
          {(editingColleague.descriptions || []).map((desc, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={desc}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                className="p-2 border rounded flex-grow"
                placeholder="Description"
              />
              <button 
                onClick={() => removeDescription(index)}
                className="ml-2 bg-red-500 text-white p-2 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => addDescription()}
            className="bg-blue-500 text-white p-2 rounded mb-2"
          >
            <Plus size={16} /> Add Description
          </button>
          <button 
            onClick={handleSave}
            className="bg-green-500 text-white p-2 rounded w-full"
          >
            <Save size={16} className="inline mr-2" /> Save Changes
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Add New Colleague</h3>
          <input
            type="text"
            value={newColleague.name}
            onChange={(e) => setNewColleague(prev => ({ ...prev, name: e.target.value }))}
            className="mb-2 p-2 border rounded w-full"
            placeholder="New Colleague Name"
          />
          <input 
            type="file" 
            onChange={(e) => handlePhotoUpload(e, true)}
            className="mb-2 w-full"
          />
          {newColleague.descriptions.map((desc, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={desc}
                onChange={(e) => handleDescriptionChange(index, e.target.value, true)}
                className="p-2 border rounded flex-grow"
                placeholder="Description"
              />
              <button 
                onClick={() => removeDescription(index, true)}
                className="ml-2 bg-red-500 text-white p-2 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => addDescription(true)}
            className="bg-blue-500 text-white p-2 rounded mb-2"
          >
            <Plus size={16} /> Add Description
          </button>
          <button 
            onClick={handleSave}
            className="bg-green-500 text-white p-2 rounded w-full"
          >
            <Save size={16} className="inline mr-2" /> Add New Colleague
          </button>
        </div>
      )}
    </div>
  );
};

export default ColleagueEditor;