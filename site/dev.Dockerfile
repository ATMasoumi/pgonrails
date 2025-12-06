FROM node:22

WORKDIR /app

ENV SUPABASE_CLI_VERSION="v2.51.0"

# Install supabase CLI for migrations on startup
RUN apt-get update && apt-get install -y curl unzip \
  && ARCH=$(uname -m) \
  && if [ "$ARCH" = "aarch64" ]; then SUPABASE_ARCH="arm64"; else SUPABASE_ARCH="amd64"; fi \
  && echo "Downloading Supabase CLI for $SUPABASE_ARCH..." \
  && curl -L https://github.com/supabase/cli/releases/download/${SUPABASE_CLI_VERSION}/supabase_linux_${SUPABASE_ARCH}.tar.gz -o supabase.tar.gz \
  && tar -xvzf supabase.tar.gz \
  && mv supabase /usr/local/bin/ \
  && rm supabase.tar.gz

COPY dev-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/dev-entrypoint.sh

ENTRYPOINT ["dev-entrypoint.sh"]