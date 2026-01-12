import { IconType } from "react-icons";
import {
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiFlutter,
  SiSwift,
  SiKotlin,
  SiAndroid,
  SiApple,
  SiElectron,
  SiPostgresql,
  SiMongodb,
  SiMysql,
  SiRedis,
  SiApachecassandra,
  SiElasticsearch,
  SiNeo4J,
  SiCockroachlabs,
  SiSqlite,
  SiMariadb,
  SiAmazondynamodb,
  SiApachekafka,
  SiRabbitmq,
  SiAmazonsqs,
  SiApachepulsar,
  SiNginx,
  SiTraefikproxy,
  SiCloudflare,
  SiAmazon,
  SiGooglecloud,
  SiVercel,
  SiNetlify,
  SiHeroku,
  SiDocker,
  SiKubernetes,
  SiTerraform,
  SiGrafana,
  SiPrometheus,
  SiDatadog,
  SiNewrelic,
  SiSentry,
  SiAuth0,
  SiOkta,
  SiFirebase,
  SiSupabase,
  SiStripe,
  SiTwilio,
  SiNodedotjs,
  SiPython,
  SiGo,
  SiRust,
  SiTypescript,
  SiFastapi,
  SiDjango,
  SiFlask,
  SiExpress,
  SiNestjs,
  SiGraphql,
  SiApollographql,
  SiAmazonec2,
  SiAmazonecs,
  SiAmazons3,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiJenkins,
  SiCircleci,
  SiGithubactions,
  SiMinio,
  SiVault,
  SiConsul,
  SiEtcd,
  SiApache,
  SiApachemaven,
  SiApachespark,
  SiSnowflake,
  SiClickhouse,
  SiTimescale,
  SiInfluxdb,
  SiLetsencrypt,
  SiKeycloak,
  SiOpenai,
  SiHuggingface,
  SiLangchain,
} from "react-icons/si";
import {
  HiOutlineGlobeAlt,
  HiOutlineDevicePhoneMobile,
  HiOutlineComputerDesktop,
  HiOutlineServer,
  HiOutlineCube,
  HiOutlineCircleStack,
  HiOutlineCloud,
  HiOutlineLockClosed,
  HiOutlineChartBar,
  HiOutlineArrowsRightLeft,
  HiOutlineSquare3Stack3D,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineBolt,
  HiOutlineCog,
} from "react-icons/hi2";

export interface TechIconConfig {
  icon: IconType;
  color: string;
  label: string;
}

export const TECH_ICONS: Record<string, TechIconConfig> = {
  react: { icon: SiReact, color: "#61DAFB", label: "React" },
  nextjs: { icon: SiNextdotjs, color: "#FFFFFF", label: "Next.js" },
  "next.js": { icon: SiNextdotjs, color: "#FFFFFF", label: "Next.js" },
  vue: { icon: SiVuedotjs, color: "#4FC08D", label: "Vue.js" },
  vuejs: { icon: SiVuedotjs, color: "#4FC08D", label: "Vue.js" },
  angular: { icon: SiAngular, color: "#DD0031", label: "Angular" },
  svelte: { icon: SiSvelte, color: "#FF3E00", label: "Svelte" },

  flutter: { icon: SiFlutter, color: "#02569B", label: "Flutter" },
  swift: { icon: SiSwift, color: "#F05138", label: "Swift" },
  ios: { icon: SiApple, color: "#FFFFFF", label: "iOS" },
  kotlin: { icon: SiKotlin, color: "#7F52FF", label: "Kotlin" },
  android: { icon: SiAndroid, color: "#3DDC84", label: "Android" },

  electron: { icon: SiElectron, color: "#47848F", label: "Electron" },

  postgresql: { icon: SiPostgresql, color: "#4169E1", label: "PostgreSQL" },
  postgres: { icon: SiPostgresql, color: "#4169E1", label: "PostgreSQL" },
  mysql: { icon: SiMysql, color: "#4479A1", label: "MySQL" },
  mariadb: { icon: SiMariadb, color: "#003545", label: "MariaDB" },
  sqlite: { icon: SiSqlite, color: "#003B57", label: "SQLite" },
  cockroachdb: {
    icon: SiCockroachlabs,
    color: "#6933FF",
    label: "CockroachDB",
  },

  mongodb: { icon: SiMongodb, color: "#47A248", label: "MongoDB" },
  mongo: { icon: SiMongodb, color: "#47A248", label: "MongoDB" },
  cassandra: { icon: SiApachecassandra, color: "#1287B1", label: "Cassandra" },
  dynamodb: { icon: SiAmazondynamodb, color: "#4053D6", label: "DynamoDB" },
  neo4j: { icon: SiNeo4J, color: "#008CC1", label: "Neo4j" },
  elasticsearch: {
    icon: SiElasticsearch,
    color: "#005571",
    label: "Elasticsearch",
  },

  timescale: { icon: SiTimescale, color: "#FDB515", label: "TimescaleDB" },
  influxdb: { icon: SiInfluxdb, color: "#22ADF6", label: "InfluxDB" },
  clickhouse: { icon: SiClickhouse, color: "#FFCC01", label: "ClickHouse" },

  redis: { icon: SiRedis, color: "#DC382D", label: "Redis" },
  memcached: {
    icon: HiOutlineSquare3Stack3D,
    color: "#00A4DB",
    label: "Memcached",
  },

  kafka: { icon: SiApachekafka, color: "#231F20", label: "Kafka" },
  rabbitmq: { icon: SiRabbitmq, color: "#FF6600", label: "RabbitMQ" },
  sqs: { icon: SiAmazonsqs, color: "#FF4F8B", label: "Amazon SQS" },
  "amazon-sqs": { icon: SiAmazonsqs, color: "#FF4F8B", label: "Amazon SQS" },
  pulsar: { icon: SiApachepulsar, color: "#188FFF", label: "Pulsar" },

  nginx: { icon: SiNginx, color: "#009639", label: "NGINX" },
  kong: { icon: HiOutlineArrowsRightLeft, color: "#003459", label: "Kong" },
  traefik: { icon: SiTraefikproxy, color: "#24A1C1", label: "Traefik" },
  haproxy: {
    icon: HiOutlineArrowsRightLeft,
    color: "#00B2A9",
    label: "HAProxy",
  },
  graphql: { icon: SiGraphql, color: "#E10098", label: "GraphQL" },
  apollo: { icon: SiApollographql, color: "#311C87", label: "Apollo" },

  aws: { icon: SiAmazon, color: "#FF9900", label: "AWS" },
  "amazon-aws": { icon: SiAmazon, color: "#FF9900", label: "AWS" },
  gcp: { icon: SiGooglecloud, color: "#4285F4", label: "Google Cloud" },
  "google-cloud": {
    icon: SiGooglecloud,
    color: "#4285F4",
    label: "Google Cloud",
  },
  azure: { icon: HiOutlineCloud, color: "#0078D4", label: "Azure" },
  cloudflare: { icon: SiCloudflare, color: "#F38020", label: "Cloudflare" },
  vercel: { icon: SiVercel, color: "#FFFFFF", label: "Vercel" },
  netlify: { icon: SiNetlify, color: "#00C7B7", label: "Netlify" },
  heroku: { icon: SiHeroku, color: "#430098", label: "Heroku" },

  ec2: { icon: SiAmazonec2, color: "#FF9900", label: "EC2" },
  "aws-ec2": { icon: SiAmazonec2, color: "#FF9900", label: "EC2" },
  ecs: { icon: SiAmazonecs, color: "#FF9900", label: "ECS" },
  "aws-ecs": { icon: SiAmazonecs, color: "#FF9900", label: "ECS" },
  s3: { icon: SiAmazons3, color: "#569A31", label: "S3" },
  "aws-s3": { icon: SiAmazons3, color: "#569A31", label: "S3" },
  "aws-alb": { icon: SiAmazon, color: "#FF9900", label: "AWS ALB" },
  lambda: { icon: SiAmazon, color: "#FF9900", label: "Lambda" },
  "aws-lambda": { icon: SiAmazon, color: "#FF9900", label: "Lambda" },

  docker: { icon: SiDocker, color: "#2496ED", label: "Docker" },
  kubernetes: { icon: SiKubernetes, color: "#326CE5", label: "Kubernetes" },
  k8s: { icon: SiKubernetes, color: "#326CE5", label: "Kubernetes" },
  terraform: { icon: SiTerraform, color: "#7B42BC", label: "Terraform" },

  grafana: { icon: SiGrafana, color: "#F46800", label: "Grafana" },
  prometheus: { icon: SiPrometheus, color: "#E6522C", label: "Prometheus" },
  datadog: { icon: SiDatadog, color: "#632CA6", label: "Datadog" },
  newrelic: { icon: SiNewrelic, color: "#008C99", label: "New Relic" },
  sentry: { icon: SiSentry, color: "#362D59", label: "Sentry" },

  auth0: { icon: SiAuth0, color: "#EB5424", label: "Auth0" },
  okta: { icon: SiOkta, color: "#007DC1", label: "Okta" },
  keycloak: { icon: SiKeycloak, color: "#4D4D4D", label: "Keycloak" },

  nodejs: { icon: SiNodedotjs, color: "#339933", label: "Node.js" },
  node: { icon: SiNodedotjs, color: "#339933", label: "Node.js" },
  express: { icon: SiExpress, color: "#FFFFFF", label: "Express" },
  nestjs: { icon: SiNestjs, color: "#E0234E", label: "NestJS" },
  python: { icon: SiPython, color: "#3776AB", label: "Python" },
  fastapi: { icon: SiFastapi, color: "#009688", label: "FastAPI" },
  django: { icon: SiDjango, color: "#092E20", label: "Django" },
  flask: { icon: SiFlask, color: "#FFFFFF", label: "Flask" },
  go: { icon: SiGo, color: "#00ADD8", label: "Go" },
  golang: { icon: SiGo, color: "#00ADD8", label: "Go" },
  rust: { icon: SiRust, color: "#FFFFFF", label: "Rust" },
  typescript: { icon: SiTypescript, color: "#3178C6", label: "TypeScript" },
  java: { icon: HiOutlineCube, color: "#ED8B00", label: "Java" },

  firebase: { icon: SiFirebase, color: "#FFCA28", label: "Firebase" },
  supabase: { icon: SiSupabase, color: "#3ECF8E", label: "Supabase" },

  stripe: { icon: SiStripe, color: "#635BFF", label: "Stripe" },
  twilio: { icon: SiTwilio, color: "#F22F46", label: "Twilio" },

  github: { icon: SiGithub, color: "#FFFFFF", label: "GitHub" },
  gitlab: { icon: SiGitlab, color: "#FC6D26", label: "GitLab" },
  bitbucket: { icon: SiBitbucket, color: "#0052CC", label: "Bitbucket" },
  jenkins: { icon: SiJenkins, color: "#D24939", label: "Jenkins" },
  circleci: { icon: SiCircleci, color: "#343434", label: "CircleCI" },
  "github-actions": {
    icon: SiGithubactions,
    color: "#2088FF",
    label: "GitHub Actions",
  },

  minio: { icon: SiMinio, color: "#C72C48", label: "MinIO" },
  gcs: { icon: SiGooglecloud, color: "#4285F4", label: "Cloud Storage" },
  "azure-blob": { icon: HiOutlineCloud, color: "#0078D4", label: "Azure Blob" },

  vault: { icon: SiVault, color: "#FFEC6E", label: "Vault" },
  consul: { icon: SiConsul, color: "#F24C53", label: "Consul" },
  etcd: { icon: SiEtcd, color: "#419EDA", label: "etcd" },
  zookeeper: { icon: SiApache, color: "#D22128", label: "ZooKeeper" },

  airflow: { icon: SiApache, color: "#017CEE", label: "Airflow" },
  spark: { icon: SiApachespark, color: "#E25A1C", label: "Spark" },
  snowflake: { icon: SiSnowflake, color: "#29B5E8", label: "Snowflake" },

  openai: { icon: SiOpenai, color: "#FFFFFF", label: "OpenAI" },
  huggingface: { icon: SiHuggingface, color: "#FFD21E", label: "Hugging Face" },
  langchain: { icon: SiLangchain, color: "#1C3C3C", label: "LangChain" },
};

export const DEFAULT_TYPE_ICONS: Record<string, TechIconConfig> = {
  client: { icon: HiOutlineGlobeAlt, color: "#f97316", label: "Client" },
  cdn: { icon: SiCloudflare, color: "#4ade80", label: "CDN" },
  gateway: {
    icon: HiOutlineArrowsRightLeft,
    color: "#60a5fa",
    label: "Gateway",
  },
  server: { icon: HiOutlineServer, color: "#facc15", label: "Server" },
  service: { icon: HiOutlineCube, color: "#fde047", label: "Service" },
  api: { icon: HiOutlineBolt, color: "#fde047", label: "API" },
  queue: { icon: HiOutlineSquare3Stack3D, color: "#f472b6", label: "Queue" },
  cache: { icon: SiRedis, color: "#34d399", label: "Cache" },
  database: { icon: HiOutlineCircleStack, color: "#fcd34d", label: "Database" },
  storage: { icon: HiOutlineDocumentText, color: "#c084fc", label: "Storage" },
  auth: { icon: HiOutlineLockClosed, color: "#f472b6", label: "Auth" },
  monitoring: {
    icon: HiOutlineChartBar,
    color: "#60a5fa",
    label: "Monitoring",
  },
  external: { icon: HiOutlineCloud, color: "#94a3b8", label: "External" },
  mobile: {
    icon: HiOutlineDevicePhoneMobile,
    color: "#f97316",
    label: "Mobile",
  },
  desktop: {
    icon: HiOutlineComputerDesktop,
    color: "#f97316",
    label: "Desktop",
  },
  user: { icon: HiOutlineUsers, color: "#f97316", label: "Users" },
  worker: { icon: HiOutlineCog, color: "#fde047", label: "Worker" },
};

export function getTechIcon(
  technology?: string,
  nodeType?: string
): TechIconConfig {
  if (technology) {
    const techKey = technology.toLowerCase().replace(/[\s.]/g, "");
    if (TECH_ICONS[techKey]) {
      return TECH_ICONS[techKey];
    }
    if (TECH_ICONS[technology.toLowerCase()]) {
      return TECH_ICONS[technology.toLowerCase()];
    }
  }

  if (nodeType) {
    const typeKey = nodeType.toLowerCase();
    if (DEFAULT_TYPE_ICONS[typeKey]) {
      return DEFAULT_TYPE_ICONS[typeKey];
    }
  }

  return { icon: HiOutlineCube, color: "#22d3ee", label: "Component" };
}

export function getDarkModeColor(color: string): string {
  if (color === "#FFFFFF") return "#e4e4e7";
  return color;
}
