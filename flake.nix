{
  description = "GitHub Action to check formatting of Haskell code with Ormolu";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_24;
      in
      {
        # Reproducible build of the bundled `dist/` directory.
        #
        # After changing dependencies (package.json / package-lock.json),
        # `npmDepsHash` must be updated. The easiest way is to set it to
        # `pkgs.lib.fakeHash`, run `nix build`, and copy the correct hash
        # from the error message.
        packages.default = pkgs.buildNpmPackage {
          pname = "run-ormolu";
          version = "1.0.0";
          src = ./.;

          npmDepsHash = "sha256-nxCFY4JkK3+tXBRGtr2BxEEwW/k+nttx/Iypo1R4s6s=";

          inherit nodejs;

          # `npm run prepare` builds dist/; we install just that directory.
          npmBuildScript = "prepare";

          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r dist $out/dist
            cp action.yml $out/
            runHook postInstall
          '';
        };

        devShells.default = pkgs.mkShell {
          packages = [ nodejs ];
        };
      });
}
