{ pkgs }: {
    deps = [
      pkgs.busybox-sandbox-shell
        pkgs.yarn
        pkgs.esbuild
        pkgs.nodejs-18_x

        pkgs.nodePackages.typescript
        pkgs.nodePackages.typescript-language-server
    ];
}