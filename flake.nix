{
  description = "Development shell for Cal's cals";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }: (flake-utils.lib.eachDefaultSystem (system: let
    pkgs = import nixpkgs {inherit system;};
  in {
    devShells.default = pkgs.mkShell {
      packages = with pkgs; [
        nodejs_24
        pnpm
        mdformat
      ];

      shellHook = ''
        export NIXSHELL="$NIXSHELL+cals-cals"
      '';
    };
  }));
}
