<script lang="ts">
  import type { wType } from "../types/wType";
  import { fileSystem, type FileSystem } from "../utils/fileSystem";
  import {
    closeWindow,
    toggleMinimize,
    toggleMaximize,
  } from "../stores/windowStore";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { syncProjectsToFileSystem } from "../utils/syncProjects";
  import { portfolio } from "../utils/portfolioData";

  const username = portfolio.personalInfo.email.split('@')[0] || 'eniseirem';
  const hostname = 'macbook';

  $: currentDirectoryPath = `~/${currentDirectory.join("/")}`;

  export let startDrag: (
    e: MouseEvent,
    id: string,
    action: "move" | "resize"
  ) => void;
  export let window: wType;

  let terminalLines: string[] = [];
  let currentInput = "";
  let terminalRef: HTMLDivElement;
  let showPrompt = false;
  let commandHistory: string[] = [];
  let historyIndex = -1;
  let currentDirectory: string[] = ["home"];

  function addLine(text: string) {
    terminalLines = [...terminalLines, text];
    scrollToBottom();
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (terminalRef) {
        terminalRef.scrollTop = terminalRef.scrollHeight;
      }
    }, 0);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        currentInput = commandHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > -1) {
        historyIndex--;
        currentInput = historyIndex === -1 ? "" : commandHistory[historyIndex];
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleTabCompletion();
    }
  }

  function processCommand(cmd: string) {
    addLine(
      `<span class="text-green-400">${username}@${hostname}</span><span class="text-white">:</span><span class="text-blue-400">~/${currentDirectory.join("/")}</span><span class="text-white">$</span> ${cmd}`
    );

    commandHistory = [cmd, ...commandHistory];
    historyIndex = -1;

    const [command, ...args] = cmd.split(" ");

    switch (command.toLowerCase()) {
      case "help":
        addLine("Available commands:");
        addLine("ls       - List directory contents");
        addLine("cd       - Change directory");
        addLine("cat      - Display file contents");
        addLine("pwd      - Print working directory");
        addLine("clear    - Clear the terminal");
        addLine("date     - Display current date and time");
        addLine("echo     - Print a message");
        break;
      case "ls":
        const currentDir = getCurrentDir();
        if (typeof currentDir === "object") {
          const items = Object.keys(currentDir);
          const itemsPerLine = 4;
          for (let i = 0; i < items.length; i += itemsPerLine) {
            const lineItems = items.slice(i, i + itemsPerLine).map((item) => {
              const isDirectory = typeof currentDir[item] === "object";
              const color = isDirectory ? "text-blue-400" : "text-white";
              return `<span class="${color}">${item}</span>`;
            });
            addLine(lineItems.join("\t"));
          }
        } else {
          addLine("Not a directory");
        }
        break;
      case "cd":
        if (args[0] === "..") {
          if (currentDirectory.length > 1) {
            currentDirectory = currentDirectory.slice(0, -1);
          }
        } else if (args[0]) {
          const newDir = getCurrentDir();
          if (
            typeof newDir === "object" &&
            args[0] in newDir &&
            typeof newDir[args[0]] === "object"
          ) {
            currentDirectory = [...currentDirectory, args[0]];
          } else {
            addLine(`cd: ${args[0]}: Not a directory`);
          }
        } else {
          currentDirectory = ["home"];
        }
        break;
      case "cat":
        if (args[0]) {
          const currentDir = getCurrentDir();
          if (typeof currentDir === "object" && args[0] in currentDir) {
            const content = currentDir[args[0]];
            if (typeof content === "string") {
              addLine(makeUrlsClickable(content));
            } else {
              addLine(`cat: ${args[0]}: Is a directory`);
            }
          } else {
            addLine(`cat: ${args[0]}: No such file or directory`);
          }
        } else {
          addLine("Usage: cat <filename>");
        }
        break;
      case "pwd":
        addLine(`/${currentDirectory.join("/")}`);
        break;
      case "clear":
        terminalLines = [];
        break;
      case "date":
        addLine(new Date().toLocaleString());
        break;
      case "echo":
        addLine(args.join(" "));
        break;
      case "exit":
        closeWindow(window.id);
        break;
      default:
        addLine(
          `Command not found: ${command}. Type "help" for available commands.`
        );
    }
  }

  function getCurrentDir(): FileSystem | string {
    return currentDirectory.reduce((acc: FileSystem, curr: string) => {
      if (typeof acc === "object" && curr in acc) {
        return acc[curr];
      }
      return acc;
    }, fileSystem);
  }

  onMount(() => {
    syncProjectsToFileSystem(fileSystem);
    showPrompt = true;
    addLine(`Welcome to ${portfolio.personalInfo.name}'s Terminal`);
    addLine('Type "help" to see available commands');
    addLine('Try "ls" to see available files and directories');
    
    // Automatically type and execute "cat about" after a short delay
    // This happens on every terminal open/refresh
    setTimeout(() => {
      const command = 'cat about';
      let typedChars = '';
      
      // Simulate typing character by character
      const typeChar = () => {
        if (typedChars.length < command.length) {
          typedChars += command[typedChars.length];
          currentInput = typedChars;
          setTimeout(typeChar, 50); // 50ms delay between characters
        } else {
          // After typing is complete, execute the command
          setTimeout(() => {
            processCommand(command);
            currentInput = '';
          }, 300);
        }
      };
      
      typeChar();
    }, 1500);
  });

  function handleTabCompletion() {
    const currentDir = getCurrentDir();
    if (
      (typeof currentDir === "object" && currentInput.includes("cd")) ||
      currentInput.includes("cat")
    ) {
      const lastWord = currentInput.split(" ").pop() || "";
      const matches = Object.keys(currentDir).filter((item) =>
        item.startsWith(lastWord)
      );
      if (matches.length === 1) {
        currentInput = currentInput.replace(
          new RegExp(lastWord + "$"),
          matches[0]
        );
      } else if (matches.length > 1) {
        addLine(matches.join("  "));
      }
    }
  }

  function makeUrlsClickable(text: string): string {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" class="text-blue-400 hover:underline">${url}</a>`);
  }
</script>

<div class="terminal-container h-full" style="isolation: isolate; contain: strict; position: relative; transform: translate3d(0, 0, 0); will-change: auto;">
  <div class="bg-gray-900/90 h-full terminal-content" style="transform: translate3d(0, 0, 0); backface-visibility: hidden;">
  <!-- Terminal Header -->
  <div
    class="bg-gray-800/80 px-4 py-2 flex items-center cursor-move"
    on:mousedown={(e) => startDrag(e, window.id, "move")}
  >
    <div class="flex space-x-2">
      <div
        class="w-3 h-3 rounded-full bg-red-500 cursor-pointer"
        on:click={() => closeWindow(window.id)}
      ></div>
      <div
        class="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer"
        on:click={() => toggleMinimize(window.id)}
      ></div>
      <div
        class="w-3 h-3 rounded-full bg-green-500 cursor-pointer"
        on:click={() => toggleMaximize(window.id)}
      ></div>
    </div>
    <div class="flex-grow text-center text-sm text-gray-400">
      {username}@{hostname}: ~/{currentDirectory.join("/")}
    </div>
  </div>

  <!-- Terminal Body -->
  <div
    bind:this={terminalRef}
    class="bg-black/30 p-4 overflow-y-auto"
    style="height: calc(100% - 80px); overflow-x: hidden; transform: translate3d(0, 0, 0);"
  >
    {#each terminalLines as line}
      <br />
      <span
        class="text-gray-200 whitespace-pre"
        transition:fade|local={{ duration: 150 }}
      >
        {@html line}
      </span>
    {/each}
  </div>

  <!-- Terminal Input -->
  {#if showPrompt}
    <div class="bg-black/30 px-4 py-2 flex items-center">
      <span class="text-green-400 mr-1">{username}@{hostname}</span>
      <span class="text-white mr-1">:</span>
      <span class="text-blue-400 mr-1">~/{currentDirectory.join("/")}</span>
      <span class="text-white mr-2">$</span>
      <input
        type="text"
        bind:value={currentInput}
        on:keydown={(e) => {
          if (e.key === "Enter" && currentInput.trim()) {
            processCommand(currentInput.trim());
            currentInput = "";
          } else {
            handleKeydown(e);
          }
        }}
        class="bg-transparent border-none outline-none flex-grow text-gray-200 w-full"
        autocomplete="off"
        autofocus
      />
    </div>
  {/if}
</div>
</div>

<style>
  .terminal-container {
    backface-visibility: hidden;
    will-change: auto;
    -webkit-font-smoothing: antialiased;
  }

  .terminal-content {
    position: relative;
    backface-visibility: hidden;
  }

  .terminal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    pointer-events: none;
    z-index: 1;
    transform: translate3d(0, 0, 0);
  }
</style>
