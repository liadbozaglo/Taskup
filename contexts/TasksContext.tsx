import React, { createContext, useContext, useState, ReactNode } from 'react';

export type WhenOption = 'flexible' | 'before' | 'on';
export type LocationOption = 'address' | 'remote';

export interface Task {
  id: string;
  title: string;
  description: string;
  whenOption: WhenOption;
  selectedDate: Date | null;
  locationOption: LocationOption;
  address: string;
  photo: string | null;
  budget: string;
  createdAt: Date;
  status: 'active' | 'in-progress' | 'completed' | 'cancelled';
  offers: Offer[];
  questions: Question[];
  userId: string; // In real app, this would come from auth
}

export interface Offer {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  amount: number;
  message: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Question {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  createdAt: Date;
}

interface TasksContextType {
  tasks: Task[];
  myTasks: Task[];
  allTasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'offers' | 'questions' | 'userId'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addOffer: (taskId: string, offer: Omit<Offer, 'id' | 'taskId' | 'createdAt' | 'status'>) => void;
  addQuestion: (taskId: string, question: Omit<Question, 'id' | 'taskId' | 'createdAt' | 'answer'>) => void;
  answerQuestion: (taskId: string, questionId: string, answer: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const currentUserId = 'user1'; // TODO: Get from auth

  const myTasks = tasks.filter(task => task.userId === currentUserId);
  const allTasks = tasks.filter(task => task.status === 'active');

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'offers' | 'questions' | 'userId'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: 'active',
      offers: [],
      questions: [],
      userId: currentUserId,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addOffer = (taskId: string, offerData: Omit<Offer, 'id' | 'taskId' | 'createdAt' | 'status'>) => {
    const newOffer: Offer = {
      ...offerData,
      id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      createdAt: new Date(),
      status: 'pending',
    };
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, offers: [...task.offers, newOffer] }
          : task
      )
    );
  };

  const addQuestion = (taskId: string, questionData: Omit<Question, 'id' | 'taskId' | 'createdAt' | 'answer'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      createdAt: new Date(),
    };
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, questions: [...task.questions, newQuestion] }
          : task
      )
    );
  };

  const answerQuestion = (taskId: string, questionId: string, answer: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              questions: task.questions.map(q =>
                q.id === questionId ? { ...q, answer } : q
              ),
            }
          : task
      )
    );
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        myTasks,
        allTasks,
        addTask,
        updateTask,
        deleteTask,
        addOffer,
        addQuestion,
        answerQuestion,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}

