import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface SocketEvent<T = unknown> {
  event: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private connected$ = new BehaviorSubject<boolean>(false);

  get isConnected$(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected$.next(false);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected$.next(false);
  }

  emit<T>(event: string, data: T): void {
    this.socket?.emit(event, data);
  }

  on<T>(event: string): Observable<T> {
    return new Observable<T>(subscriber => {
      this.socket?.on(event, (data: T) => {
        subscriber.next(data);
      });

      return () => {
        this.socket?.off(event);
      };
    });
  }
}
