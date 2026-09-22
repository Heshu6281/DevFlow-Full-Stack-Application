import { useEffect, useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  RotateCcw,
  ListPlus,
  Wand2,
  CheckSquare,
  Square,
  Save,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react';

import api from '@/services/api';

const suggestions = [
  'Explain React components in simple words.',
  'How can I improve my JavaScript code?',
  'Help me debug a Node.js API.',
  'Give me tips to improve developer productivity.',
];

const emptyEditForm = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'To Do',
};

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [projectDescription, setProjectDescription] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [generatingTasks, setGeneratingTasks] = useState(false);

  // Step 24B: New project details used when saving AI-generated tasks.
  const [projectName, setProjectName] = useState('');

  // Selected generated task indexes.
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Saving state.
  const [savingTasks, setSavingTasks] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Step 23: Edit task modal/state.
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState(
    emptyEditForm
  );

  /*
   * Send normal AI chat message.
   */
  const sendMessage = async (
    messageText = input
  ) => {
    const message = messageText.trim();

    if (!message || loading) {
      return;
    }

    setError('');
    setInput('');

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: message,
      },
    ]);

    setLoading(true);

    try {
      const response = await api.request(
        '/ai/chat',
        {
          method: 'POST',
          body: JSON.stringify({ message }),
        }
      );

      const aiMessage =
        response?.data?.message;

      if (!aiMessage) {
        throw new Error(
          'No response received from AI.'
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: aiMessage,
        },
      ]);
    } catch (err) {
      setError(
        err.message ||
          'Unable to get a response from DevFlow AI.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Generate development tasks using Gemini.
   */
  const generateTasks = async () => {
    const description =
      projectDescription.trim();

    if (!description || generatingTasks) {
      return;
    }

    setError('');
    setSaveMessage('');
    setGeneratedTasks([]);
    setSelectedTasks([]);
    setGeneratingTasks(true);

    try {
      const response = await api.request(
        '/ai/generate-tasks',
        {
          method: 'POST',
          body: JSON.stringify({
            projectDescription: description,
          }),
        }
      );

      const tasks = response?.data?.tasks;

      if (!Array.isArray(tasks)) {
        throw new Error(
          'No tasks were generated.'
        );
      }

      const normalizedTasks = tasks
        .filter((task) => task?.title)
        .map((task) => ({
          title: task.title || '',
          description:
            task.description || '',
          priority:
            task.priority || 'Medium',
          status: task.status || 'To Do',
        }));

      setGeneratedTasks(
        normalizedTasks
      );
    } catch (err) {
      setError(
        err.message ||
          'Unable to generate development tasks.'
      );
    } finally {
      setGeneratingTasks(false);
    }
  };

  /*
   * Select / unselect one generated task.
   */
  const toggleTask = (index) => {
    setSelectedTasks((prev) => {
      if (prev.includes(index)) {
        return prev.filter(
          (item) => item !== index
        );
      }

      return [...prev, index];
    });

    setSaveMessage('');
  };

  /*
   * Select all generated tasks.
   */
  const selectAllTasks = () => {
    setSelectedTasks(
      generatedTasks.map(
        (_, index) => index
      )
    );

    setSaveMessage('');
  };

  /*
   * Clear selection.
   */
  const clearSelection = () => {
    setSelectedTasks([]);
    setSaveMessage('');
  };

  /*
   * STEP 23:
   * Open edit form for a generated task.
   */
  const openEditTask = (index) => {
    const task = generatedTasks[index];

    if (!task) {
      return;
    }

    setEditingIndex(index);

    setEditForm({
      title: task.title || '',
      description:
        task.description || '',
      priority:
        task.priority || 'Medium',
      status:
        task.status || 'To Do',
    });

    setError('');
    setSaveMessage('');
  };

  /*
   * STEP 23:
   * Save changes to the temporary generated task.
   */
  const saveEditedTask = (event) => {
    event.preventDefault();

    if (editingIndex === null) {
      return;
    }

    const title =
      editForm.title.trim();

    if (!title) {
      setError(
        'Task title cannot be empty.'
      );
      return;
    }

    const updatedTask = {
      title,
      description:
        editForm.description.trim(),
      priority: editForm.priority,
      status: editForm.status,
    };

    setGeneratedTasks((prev) =>
      prev.map((task, index) =>
        index === editingIndex
          ? updatedTask
          : task
      )
    );

    setEditingIndex(null);
    setEditForm(emptyEditForm);
    setError('');
  };

  /*
   * Close edit form.
   */
  const closeEditTask = () => {
    if (savingTasks) {
      return;
    }

    setEditingIndex(null);
    setEditForm(emptyEditForm);
  };

  /*
   * STEP 23:
   * Remove generated task.
   */
  const removeTask = (index) => {
    const task = generatedTasks[index];

    if (!task) {
      return;
    }

    setGeneratedTasks((prev) =>
      prev.filter(
        (_, taskIndex) =>
          taskIndex !== index
      )
    );

    /*
     * Rebuild selected indexes because
     * removing an array item shifts indexes.
     */
    setSelectedTasks((prev) =>
      prev
        .filter(
          (selectedIndex) =>
            selectedIndex !== index
        )
        .map((selectedIndex) =>
          selectedIndex > index
            ? selectedIndex - 1
            : selectedIndex
        )
    );

    setSaveMessage('');
  };

  /*
   * STEP 24B:
   * Save a new project and the selected generated tasks together.
   *
   * The backend uses a MySQL transaction, so either the project
   * and all selected tasks are saved, or nothing is saved.
   */
  const saveProjectAndTasks = async () => {
    if (savingTasks) {
      return;
    }

    const name = projectName.trim();

    if (!name) {
      setError('Please enter a project name.');
      return;
    }

    if (selectedTasks.length === 0) {
      setError('Please select at least one task to save.');
      return;
    }

    const selectedGeneratedTasks = selectedTasks
      .map((index) => generatedTasks[index])
      .filter(Boolean);

    if (selectedGeneratedTasks.length === 0) {
      setError('No valid tasks were selected.');
      return;
    }

    setError('');
    setSaveMessage('');
    setSavingTasks(true);

    try {
      const payload = {
        project: {
          name,
          description: projectDescription.trim(),
          status: 'To Do',
          progress: 0,
          technologies: [],
        },
        tasks: selectedGeneratedTasks.map((task) => ({
          title: task.title.trim(),
          description: task.description?.trim() || '',
          priority: task.priority || 'Medium',
          status: task.status || 'To Do',
        })),
      };

      const response = await api.request('/ai/save-project', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.success) {
        throw new Error(
          response.message ||
            'Unable to save project and selected tasks.'
        );
      }

      const savedProject = response?.data?.project;
      const savedTasks = response?.data?.tasks || [];

      setSaveMessage(
        `"${savedProject?.name || name}" and ${
          savedTasks.length
        } ${
          savedTasks.length === 1 ? 'task' : 'tasks'
        } were saved successfully.`
      );

      // Remove the tasks that were successfully saved.
      setGeneratedTasks((prev) =>
        prev.filter((_, index) => !selectedTasks.includes(index))
      );

      setSelectedTasks([]);
      setProjectName('');
      setProjectDescription('');
    } catch (err) {
      setError(
        err.message ||
          'Unable to save project and selected tasks.'
      );
    } finally {
      setSavingTasks(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    setInput('');
  };

  const clearGeneratedTasks = () => {
    setGeneratedTasks([]);
    setProjectName('');
    setProjectDescription('');
    setSelectedTasks([]);
    setSaveMessage('');
    setEditingIndex(null);
    setEditForm(emptyEditForm);
  };

  const allSelected =
    generatedTasks.length > 0 &&
    selectedTasks.length ===
      generatedTasks.length;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">

      {/* Header */}
      <div className="border-b border-border bg-surface px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
              <Bot className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-text-primary">
                DevFlow AI
              </h1>

              <p className="text-xs text-text-secondary">
                Your AI assistant for development and productivity
              </p>
            </div>

          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          )}

        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6">

        <div className="mx-auto max-w-5xl">

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Sparkles className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-bold text-text-primary">
                How can I help you?
              </h2>

              <p className="mt-2 max-w-md text-sm text-text-secondary">
                Ask DevFlow AI about programming, debugging, projects,
                productivity, or software development.
              </p>

              {/* Suggestions */}
              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">

                {suggestions.map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        sendMessage(
                          suggestion
                        )
                      }
                      className="rounded-xl border border-border bg-surface p-4 text-left text-sm text-text-secondary transition-all hover:border-accent/30 hover:bg-accent-soft hover:text-text-primary"
                    >
                      {suggestion}
                    </button>
                  )
                )}

              </div>

              {/* AI Task Generator */}
              <div className="mt-8 w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 text-left shadow-soft">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <ListPlus className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      Generate Development Tasks
                    </h3>

                    <p className="mt-1 text-xs text-text-secondary">
                      Describe your project and let DevFlow AI create
                      actionable development tasks.
                    </p>
                  </div>

                </div>

                <input
                  type="text"
                  value={projectName}
                  onChange={(event) =>
                    setProjectName(event.target.value)
                  }
                  placeholder="Project name (example: Developer Productivity App)"
                  disabled={
                    generatingTasks ||
                    savingTasks
                  }
                  className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <textarea
                  value={projectDescription}
                  onChange={(event) =>
                    setProjectDescription(
                      event.target.value
                    )
                  }
                  placeholder="Example: Build an e-commerce application using React, Node.js and MySQL..."
                  rows={4}
                  disabled={
                    generatingTasks ||
                    savingTasks
                  }
                  className="mt-4 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={generateTasks}
                  disabled={
                    !projectName.trim() ||
                    !projectDescription.trim() ||
                    generatingTasks ||
                    savingTasks
                  }
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generatingTasks ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Tasks
                    </>
                  )}
                </button>

              </div>

              {/* Generated Tasks */}
              {generatedTasks.length > 0 && (
                <div className="mt-6 w-full max-w-2xl text-left">

                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        Generated Tasks
                      </h3>

                      <p className="text-xs text-text-secondary">
                        {generatedTasks.length}{' '}
                        {generatedTasks.length === 1
                          ? 'task'
                          : 'tasks'}{' '}
                        generated by DevFlow AI
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        clearGeneratedTasks
                      }
                      disabled={savingTasks}
                      className="self-start text-xs font-medium text-text-secondary hover:text-text-primary disabled:opacity-50"
                    >
                      Clear
                    </button>

                  </div>

                  {/* New Project Details */}
                  <div className="mb-4 rounded-xl border border-border bg-surface p-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="text-sm font-semibold text-text-primary">
                        New Project
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-text-secondary">
                      The project will be created in MySQL together with the
                      selected tasks.
                    </p>

                    <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-secondary">
                      <span className="font-medium text-text-primary">
                        Project:
                      </span>{' '}
                      {projectName.trim() || 'Enter a project name above'}
                    </div>
                  </div>

                  {/* Selection Controls */}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

                    <span className="text-xs text-text-secondary">
                      {selectedTasks.length} of{' '}
                      {generatedTasks.length}{' '}
                      selected
                    </span>

                    <button
                      type="button"
                      onClick={
                        allSelected
                          ? clearSelection
                          : selectAllTasks
                      }
                      disabled={savingTasks}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline disabled:opacity-50"
                    >
                      {allSelected ? (
                        <>
                          <Square className="h-3.5 w-3.5" />
                          Clear Selection
                        </>
                      ) : (
                        <>
                          <CheckSquare className="h-3.5 w-3.5" />
                          Select All
                        </>
                      )}
                    </button>

                  </div>

                  {/* Task List */}
                  <div className="space-y-3">

                    {generatedTasks.map(
                      (task, index) => {
                        const selected =
                          selectedTasks.includes(
                            index
                          );

                        return (
                          <div
                            key={`${task.title}-${index}`}
                            className={`rounded-xl border p-4 transition-all ${
                              selected
                                ? 'border-accent bg-accent-soft'
                                : 'border-border bg-surface'
                            }`}
                          >

                            <div className="flex items-start gap-3">

                              {/* Selection */}
                              <button
                                type="button"
                                onClick={() =>
                                  toggleTask(
                                    index
                                  )
                                }
                                disabled={
                                  savingTasks
                                }
                                className={`mt-0.5 shrink-0 ${
                                  selected
                                    ? 'text-accent'
                                    : 'text-text-tertiary'
                                }`}
                                aria-label={
                                  selected
                                    ? 'Unselect task'
                                    : 'Select task'
                                }
                              >
                                {selected ? (
                                  <CheckSquare className="h-5 w-5" />
                                ) : (
                                  <Square className="h-5 w-5" />
                                )}
                              </button>

                              {/* Task Content */}
                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-3">

                                  <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-text-primary">
                                      {task.title}
                                    </h4>

                                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                                      {task.description}
                                    </p>
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                      task.priority ===
                                      'High'
                                        ? 'bg-danger/10 text-danger'
                                        : task.priority ===
                                          'Medium'
                                          ? 'bg-warning/10 text-warning'
                                          : 'bg-success/10 text-success'
                                    }`}
                                  >
                                    {task.priority}
                                  </span>

                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">

                                  <span className="rounded-full bg-surface-2 px-2 py-1 text-[10px] font-medium text-text-secondary">
                                    {task.status}
                                  </span>

                                  {/* Edit / Remove */}
                                  <div className="flex items-center gap-1">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEditTask(
                                          index
                                        )
                                      }
                                      disabled={
                                        savingTasks
                                      }
                                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-2 hover:text-text-primary disabled:opacity-50"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeTask(
                                          index
                                        )
                                      }
                                      disabled={
                                        savingTasks
                                      }
                                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      Remove
                                    </button>

                                  </div>

                                </div>

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* Save Button */}
                  <button
                    type="button"
                    onClick={
                      saveProjectAndTasks
                    }
                    disabled={
                      savingTasks ||
                      selectedTasks.length === 0 ||
                      !projectName.trim()
                    }
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingTasks ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Project...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Project + Tasks
                      </>
                    )}
                  </button>

                  {/* Save Success */}
                  {saveMessage && (
                    <div className="mt-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
                      {saveMessage}
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            /* Chat Messages */
            <div className="space-y-5">

              {messages.map(
                (message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role ===
                      'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    {message.role ===
                      'assistant' && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        message.role ===
                        'user'
                          ? 'bg-accent text-white'
                          : 'border border-border bg-surface text-text-primary'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>

                    {message.role ===
                      'user' && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-secondary">
                        <User className="h-4 w-4" />
                      </div>
                    )}

                  </div>
                )
              )}

              {loading && (
                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    DevFlow AI is thinking...
                  </div>

                </div>
              )}

            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-border bg-surface px-4 py-4 sm:px-6">

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-5xl items-center gap-2"
        >

          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            placeholder="Ask DevFlow AI anything..."
            disabled={loading}
            className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={
              !input.trim() ||
              loading
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>

        </form>
      </div>

      {/* Edit Task Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  Edit Generated Task
                </h3>

                <p className="mt-1 text-xs text-text-secondary">
                  Update this task before saving it to your project.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditTask}
                disabled={savingTasks}
                className="rounded-lg p-2 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary disabled:opacity-50"
                aria-label="Close edit task"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={saveEditedTask}
              className="mt-5 space-y-4"
            >

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Task Title
                </label>

                <input
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      title:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Task title"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Description
                </label>

                <textarea
                  value={
                    editForm.description
                  }
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      description:
                        event.target.value,
                    })
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Task description"
                />
              </div>

              {/* Priority + Status */}
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Priority
                  </label>

                  <select
                    value={
                      editForm.priority
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        priority:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Status
                  </label>

                  <select
                    value={
                      editForm.status
                    }
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        status:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    <option value="To Do">
                      To Do
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Blocked">
                      Blocked
                    </option>
                  </select>
                </div>

              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={closeEditTask}
                  disabled={savingTasks}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-2 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingTasks}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Save Changes
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

