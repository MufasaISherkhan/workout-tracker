const { useState, useEffect } = React;
const { Plus, Trash2, Calendar, Target, TrendingUp, Save, Download, Upload } = lucideReact;

const WorkoutTracker = () => {
  // Initialize with localStorage for persistence
  const [workouts, setWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('workoutTrackerData');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '', sets: [], notes: '' });
  const [showHistory, setShowHistory] = useState(false);

  // Save to localStorage whenever workouts change
  useEffect(() => {
    try {
      localStorage.setItem('workoutTrackerData', JSON.stringify(workouts));
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  }, [workouts]);

  // Common exercise suggestions
  const exerciseSuggestions = [
    'Bench Press', 'Squats', 'Deadlifts', 'Pull-ups', 'Push-ups', 'Rows',
    'Overhead Press', 'Bicep Curls', 'Tricep Extensions', 'Lunges',
    'Planks', 'Lat Pulldowns', 'Leg Press', 'Shoulder Press'
  ];

  // Export data function
  const exportData = () => {
    const dataStr = JSON.stringify(workouts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import data function
  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedWorkouts = JSON.parse(e.target.result);
          if (Array.isArray(importedWorkouts)) {
            setWorkouts(importedWorkouts);
            alert('Data imported successfully!');
          }
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = ''; // Reset input
  };

  const startNewWorkout = () => {
    const workout = {
      id: Date.now(),
      date: new Date().toISOString(),
      exercises: [],
      duration: 0,
      startTime: Date.now()
    };
    setCurrentWorkout(workout);
    setExercises([]);
    setShowHistory(false);
  };

  const addSet = () => {
    setNewExercise(prev => ({
      ...prev,
      sets: [...prev.sets, { reps: '', weight: '', completed: false }]
    }));
  };

  const updateSet = (setIndex, field, value) => {
    setNewExercise(prev => ({
      ...prev,
      sets: prev.sets.map((set, index) => 
        index === setIndex ? { ...set, [field]: value } : set
      )
    }));
  };

  const removeSet = (setIndex) => {
    setNewExercise(prev => ({
      ...prev,
      sets: prev.sets.filter((_, index) => index !== setIndex)
    }));
  };

  const addExercise = () => {
    if (newExercise.name && newExercise.sets.length > 0) {
      const exercise = {
        id: Date.now(),
        name: newExercise.name,
        sets: newExercise.sets.filter(set => set.reps || set.weight),
        notes: newExercise.notes,
        timestamp: new Date().toISOString()
      };
      setExercises(prev => [...prev, exercise]);
      setNewExercise({ name: '', sets: [], notes: '' });
    }
  };

  const removeExercise = (exerciseId) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const saveWorkout = () => {
    if (currentWorkout && exercises.length > 0) {
      const completedWorkout = {
        ...currentWorkout,
        exercises: exercises,
        duration: Math.round((Date.now() - currentWorkout.startTime) / 1000 / 60),
        endTime: Date.now()
      };
      setWorkouts(prev => [completedWorkout, ...prev]);
      setCurrentWorkout(null);
      setExercises([]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalSets = (workout) => {
    return workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  const getTotalReps = (workout) => {
    return workout.exercises.reduce((total, exercise) => 
      total + exercise.sets.reduce((setTotal, set) => setTotal + (parseInt(set.reps) || 0), 0), 0
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">💪 Workout Tracker</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={startNewWorkout}
              disabled={currentWorkout}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <Plus size={18} />
              Start Workout
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <Calendar size={18} />
              History ({workouts.length})
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Download size={18} />
              Export
            </button>
            <label className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer text-sm font-medium">
              <Upload size={18} />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Current Workout */}
        {currentWorkout && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Current Workout</h2>
              <div className="text-xs sm:text-sm text-gray-600">
                Started: {new Date(currentWorkout.date).toLocaleTimeString()}
              </div>
            </div>

            {/* Add Exercise Form */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
              <h3 className="font-medium text-gray-700 mb-3 text-sm sm:text-base">Add Exercise</h3>
              
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  list="exercise-suggestions"
                />
                <datalist id="exercise-suggestions">
                  {exerciseSuggestions.map(exercise => (
                    <option key={exercise} value={exercise} />
                  ))}
                </datalist>
              </div>

              {/* Sets */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Sets</span>
                  <button
                    onClick={addSet}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium px-2 py-1"
                  >
                    + Add Set
                  </button>
                </div>
                
                {newExercise.sets.map((set, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8">#{index + 1}</span>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(e) => updateSet(index, 'reps', e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Weight"
                      value={set.weight}
                      onChange={(e) => updateSet(index, 'weight', e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={() => removeSet(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <textarea
                  placeholder="Notes (optional)"
                  value={newExercise.notes}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows="2"
                />
              </div>

              <button
                onClick={addExercise}
                disabled={!newExercise.name || newExercise.sets.length === 0}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
              >
                Add Exercise
              </button>
            </div>

            {/* Current Exercises */}
            {exercises.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-3 text-sm sm:text-base">Today's Exercises</h3>
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base">{exercise.name}</h4>
                      <button
                        onClick={() => removeExercise(exercise.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {exercise.sets.map((set, index) => (
                        <div key={index} className="bg-white rounded p-2 text-xs sm:text-sm">
                          <span className="font-medium">Set {index + 1}: </span>
                          {set.reps} reps{set.weight && ` @ ${set.weight} lbs`}
                        </div>
                      ))}
                    </div>
                    {exercise.notes && (
                      <div className="mt-2 text-xs sm:text-sm text-gray-600 italic">{exercise.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Save Workout */}
            {exercises.length > 0 && (
              <button
                onClick={saveWorkout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
              >
                <Save size={20} />
                Complete Workout
              </button>
            )}
          </div>
        )}

        {/* Workout History */}
        {showHistory && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Workout History</h2>
            {workouts.length === 0 ? (
              <p className="text-gray-600 text-center py-8 text-sm sm:text-base">No workouts recorded yet. Start your first workout!</p>
            ) : (
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <div key={workout.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-800 text-sm sm:text-base">{formatDate(workout.date)}</h3>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Target size={12} />
                            {workout.exercises.length} exercises
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={12} />
                            {getTotalSets(workout)} sets
                          </span>
                          <span>{getTotalReps(workout)} reps</span>
                          <span>{workout.duration} min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {workout.exercises.map((exercise) => (
                        <div key={exercise.id} className="bg-gray-50 rounded p-3">
                          <h4 className="font-medium text-gray-700 mb-1 text-sm">{exercise.name}</h4>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {exercise.sets.map((set, index) => (
                              <span key={index} className="mr-3">
                                {set.reps}r{set.weight ? `@${set.weight}lbs` : ''}
                              </span>
                            ))}
                          </div>
                          {exercise.notes && (
                            <div className="text-xs text-gray-500 mt-1 italic">{exercise.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Summary */}
        {!currentWorkout && workouts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{workouts.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {workouts.reduce((sum, w) => sum + w.exercises.length, 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Exercises</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {workouts.reduce((sum, w) => sum + getTotalSets(w), 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Sets</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {workouts.reduce((sum, w) => sum + getTotalReps(w), 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Reps</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<WorkoutTracker />, document.getElementById('root'));
