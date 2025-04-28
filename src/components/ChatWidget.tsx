"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './chatwidget.module.css'; // 确认路径正确

interface ChatWidgetProps {}

const ChatWidget: React.FC<ChatWidgetProps> = () => {
    // --- State & Refs ---
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatButtonRef = useRef<HTMLButtonElement>(null);
    const hasInitializedPosition = useRef(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const startDragPos = useRef({ x: 0, y: 0 });
    const didMouseMove = useRef(false);
    const clickThreshold = 5;

    // --- Helper Function ---
    const getButtonSize = useCallback(() => {
        const defaultSize = { width: 60, height: 60 };
        if (chatButtonRef.current) {
            const rect = chatButtonRef.current.getBoundingClientRect();
            return {
                width: rect.width > 0 ? rect.width : defaultSize.width,
                height: rect.height > 0 ? rect.height : defaultSize.height,
            };
        }
        return defaultSize;
    }, []);

    // --- Effects ---
    useEffect(() => { // Initialize position
        if (chatButtonRef.current && !hasInitializedPosition.current && typeof window !== 'undefined') {
            try {
                const buttonSize = getButtonSize();
                const computedStyle = window.getComputedStyle(chatButtonRef.current);
                const initialRight = parseFloat(computedStyle.right || '30');
                const initialBottom = parseFloat(computedStyle.bottom || '30');
                const safeRight = isNaN(initialRight) ? 30 : initialRight;
                const safeBottom = isNaN(initialBottom) ? 30 : initialBottom;
                const initialX = window.innerWidth - buttonSize.width - safeRight;
                const initialY = window.innerHeight - buttonSize.height - safeBottom;
                if (isFinite(initialX) && isFinite(initialY)) {
                    setPosition({ x: initialX, y: initialY });
                    hasInitializedPosition.current = true;
                } else {
                    setPosition({ x: window.innerWidth - 90, y: window.innerHeight - 90 }); // Fallback
                    hasInitializedPosition.current = true;
                }
            } catch (error) {
                 console.error("ChatWidget: Error during initial position calculation.", error);
                 if (typeof window !== 'undefined') { // Fallback
                    setPosition({ x: window.innerWidth - 90, y: window.innerHeight - 90 });
                    hasInitializedPosition.current = true;
                 }
            }
        }
    }, [getButtonSize]);

    // Define callbacks before the effect that uses them
    const toggleChatWindow = useCallback(() => { setIsChatOpen(prevIsOpen => !prevIsOpen); }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!chatButtonRef.current || !hasInitializedPosition.current) return;
        const rect = chatButtonRef.current.getBoundingClientRect();
        setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setIsDragging(true);
        startDragPos.current = { x: e.clientX, y: e.clientY };
        didMouseMove.current = false;
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        didMouseMove.current = true;
        const buttonSize = getButtonSize();
        let newX = e.clientX - offset.x;
        let newY = e.clientY - offset.y;
        newX = Math.max(0, Math.min(newX, window.innerWidth - buttonSize.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - buttonSize.height));
        setPosition({ x: newX, y: newY });
    }, [isDragging, offset, getButtonSize]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        const dx = e.clientX - startDragPos.current.x;
        const dy = e.clientY - startDragPos.current.y;
        const distanceMoved = Math.sqrt(dx * dx + dy * dy);
        if (distanceMoved < clickThreshold) {
            toggleChatWindow();
        }
    }, [isDragging, toggleChatWindow, clickThreshold]);

    useEffect(() => { // Drag listeners
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    // --- Render/Calculation Helpers ---
    const renderChatWindowContent = (): React.ReactNode => {
        return (
             <div style={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', cursor: 'default' }}>
                 <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#333' }}>在线聊天</h3>
                 <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '10px', lineHeight: '1.5' }}>
                     <p style={{ color: '#555' }}>您好！有什么可以帮您？</p>
                     <p style={{ color: '#777', textAlign: 'right' }}>我想咨询一下...</p>
                 </div>
                 <input type="text" placeholder="输入消息..." style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}/>
             </div>
         );
    };

    // 计算聊天窗口的最终位置 (用于内联样式)
    const calculateWindowPositionStyle = useCallback((): React.CSSProperties => {
        const windowWidth = 320;
        const windowHeight = 450;
        const buttonSize = getButtonSize();
        const spacing = 10;
        let finalTop = 0;
        let finalLeft = 0;

        if (typeof window !== 'undefined' && hasInitializedPosition.current) {
            let targetTop = position.y - windowHeight - spacing;
            let targetLeft = position.x + buttonSize.width - windowWidth;
            if (targetTop < 0) { targetTop = position.y + buttonSize.height + spacing; }
            if (targetLeft < 0) { targetLeft = 0; }
            if (targetLeft + windowWidth > window.innerWidth) { targetLeft = window.innerWidth - windowWidth; }
            if (targetTop + windowHeight > window.innerHeight) { targetTop = window.innerHeight - windowHeight; }
            finalTop = Math.max(0, targetTop);
            finalLeft = Math.max(0, targetLeft);
        } else {
            finalTop = -9999; finalLeft = -9999; // 初始隐藏
        }
        return {
            // position: 'fixed' 由 CSS 类提供
            top: `${finalTop}px`,
            left: `${finalLeft}px`,
        };
    }, [position, getButtonSize]); // 依赖 position 和 getButtonSize

    const chatWindowPositionStyle = calculateWindowPositionStyle();

    // 准备按钮的内联样式
    const buttonInlineStyle: React.CSSProperties | undefined = hasInitializedPosition.current ? {
        left: `${position.x}px`, top: `${position.y}px`,
        visibility: 'visible', opacity: 1,
    } : undefined;

    // --- JSX Return ---
    return (
        <>
            {/* 单个按钮 */}
            <button
                ref={chatButtonRef}
                className={styles.chatWidgetButton} // 应用基础样式和初始定位
                onMouseDown={handleMouseDown}       // 处理拖动/点击开始
                aria-label={isChatOpen ? "关闭聊天窗口" : "打开聊天窗口"}
                id="chat-widget-button"
                style={buttonInlineStyle}         // JS 控制的位置 (left/top) 和可见性
            >
                {/* 条件 SVG 图标 */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                   {isChatOpen ? ( <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/> ) : ( <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/> )}
                </svg>
            </button>

            {/* 普通 div 作为聊天窗口, 使用 CSS 类控制显隐和动画 */}
            <div
                className={`${styles.chatWindow} ${isChatOpen ? styles.chatWindowVisible : ''}`}
                aria-hidden={!isChatOpen}
                style={chatWindowPositionStyle} // 应用 JS 计算的 top/left
            >
                {/* 只在打开时渲染内容 */}
                {isChatOpen && renderChatWindowContent()}
            </div>
        </>
    );
};

export default ChatWidget;