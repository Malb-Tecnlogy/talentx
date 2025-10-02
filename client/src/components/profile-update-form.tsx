import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Plus, X, CheckCircle2 } from "lucide-react";

const profileUpdateSchema = z.object({
  // Academic experience
  education: z.array(z.object({
    formation: z.string(),
    degree: z.string(),
    status: z.string(),
    course: z.string(),
    institution: z.string(),
    startMonth: z.string(),
    startYear: z.string(),
    endMonth: z.string().optional(),
    endYear: z.string().optional(),
  })).optional(),
  
  // Professional experience  
  workExperience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    isCurrent: z.boolean(),
    startMonth: z.string(),
    startYear: z.string(),
    endMonth: z.string().optional(),
    endYear: z.string().optional(),
    description: z.string(),
  })).optional(),
  
  // Personal data
  gender: z.string().optional(),
  hasDisability: z.boolean().optional(),
  disabilityDetails: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  linkedinUrl: z.string().optional(),
  
  // Diversity
  originState: z.string().optional(),
  originCity: z.string().optional(),
  pronoun: z.string().optional(),
  genderIdentity: z.string().optional(),
  sexualOrientation: z.string().optional(),
  race: z.string().optional(),
  diversityConsent: z.boolean().optional(),
  
  // Skills
  skills: z.array(z.string()).max(30).optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

export function ProfileUpdateForm({ professional }: { professional: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState("");

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      education: professional?.education || [],
      workExperience: professional?.workExperience || [],
      gender: professional?.gender || "",
      hasDisability: professional?.hasDisability || false,
      disabilityDetails: professional?.disabilityDetails || "",
      address: professional?.address || "",
      zipCode: professional?.zipCode || "",
      state: professional?.state || "",
      city: professional?.city || "",
      linkedinUrl: professional?.linkedinUrl || "",
      originState: professional?.originState || "",
      originCity: professional?.originCity || "",
      pronoun: professional?.pronoun || "",
      genderIdentity: professional?.genderIdentity || "",
      sexualOrientation: professional?.sexualOrientation || "",
      race: professional?.race || "",
      diversityConsent: professional?.diversityConsent || false,
      skills: professional?.skills || [],
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileUpdateFormData) => {
      const res = await apiRequest("PATCH", `/api/professionals/${professional.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals/my"] });
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateFormData) => {
    updateMutation.mutate(data);
  };

  const addSkill = () => {
    const currentSkills = form.getValues("skills") || [];
    if (newSkill && currentSkills.length < 30 && !currentSkills.includes(newSkill)) {
      form.setValue("skills", [...currentSkills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue("skills", currentSkills.filter(s => s !== skill));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-sm text-muted-foreground mb-4">
          Preencha os blocos com seus dados e mantenha seu currículo atualizado para se candidatar às vagas. 
          Caso realize alterações, estes ajustes serão <strong>replicados para todas as suas candidaturas ativas.</strong>
        </div>

        <Accordion type="multiple" className="space-y-4">
          {/* Academic Experience */}
          <AccordionItem value="education">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Experiência</span>
                {educationFields.length > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div>
                <h3 className="font-medium mb-4">Experiência acadêmica</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você pode informar mais de uma experiência acadêmica, caso seja necessário.
                </p>

                {educationFields.map((field, index) => (
                  <Card key={field.id} className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-base">Experiência acadêmica {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.formation`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Formação *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Superior">Superior</SelectItem>
                                  <SelectItem value="Mestrado">Mestrado</SelectItem>
                                  <SelectItem value="Doutorado">Doutorado</SelectItem>
                                  <SelectItem value="Pós-Doutorado">Pós-Doutorado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grau *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Graduação">Graduação</SelectItem>
                                  <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                                  <SelectItem value="Bacharel">Bacharel</SelectItem>
                                  <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                                  <SelectItem value="Mestrado">Mestrado</SelectItem>
                                  <SelectItem value="Doutorado">Doutorado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.status`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Completo">Completo</SelectItem>
                                  <SelectItem value="Cursando">Cursando</SelectItem>
                                  <SelectItem value="Trancado">Trancado</SelectItem>
                                  <SelectItem value="Incompleto">Incompleto</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.course`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Curso *</FormLabel>
                              <FormControl>
                                <Input placeholder="Information Systems degree" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`education.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instituição *</FormLabel>
                            <FormControl>
                              <Input placeholder="Universidade Paulista UNIP" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.startMonth`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Início *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Mês" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.startYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>&nbsp;</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ano" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.endMonth`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fim *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Mês" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`education.${index}.endYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>&nbsp;</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ano" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover formação
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendEducation({
                    formation: "",
                    degree: "",
                    status: "",
                    course: "",
                    institution: "",
                    startMonth: "",
                    startYear: "",
                    endMonth: "",
                    endYear: "",
                  })}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar outra formação
                </Button>
              </div>

              {/* Professional Experience */}
              <div className="pt-6 border-t">
                <h3 className="font-medium mb-4">Experiência profissional</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você pode informar mais de uma experiência profissional, caso seja necessário.
                </p>

                {workFields.map((field, index) => (
                  <Card key={field.id} className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-base">Experiência profissional {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.company`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Empresa *</FormLabel>
                              <FormControl>
                                <Input placeholder="ANDERSON DE SOUZA ALVES" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cargo *</FormLabel>
                              <FormControl>
                                <Input placeholder="Software Architect" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.isCurrent`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Meu emprego atual</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.startMonth`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Início *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Mês" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {months.map((month) => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`workExperience.${index}.startYear`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>&nbsp;</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ano" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição das atividades</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="As a Solutions Architect, I have developed and delivered innovative solutions..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeWork(index)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover experiência
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendWork({
                    company: "",
                    position: "",
                    isCurrent: false,
                    startMonth: "",
                    startYear: "",
                    endMonth: "",
                    endYear: "",
                    description: "",
                  })}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar outra experiência
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Personal Data */}
          <AccordionItem value="personal">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Dados Pessoais</span>
                {form.watch("gender") && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <p className="text-sm text-muted-foreground mb-2">
                      Selecione o gênero que você se identifica *
                    </p>
                    <div className="flex gap-4">
                      {["Feminino", "Masculino", "Não-binário", "Outros", "Prefiro não responder"].map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant={field.value === option ? "default" : "outline"}
                          onClick={() => field.onChange(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasDisability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deficiência</FormLabel>
                    <p className="text-sm text-muted-foreground mb-2">
                      Você quer se candidatar para a vaga como Pessoa com Deficiência? 
                      Saiba mais sobre nosso <a href="#" className="text-primary underline">aviso de privacidade</a>. *
                    </p>
                    <div className="flex gap-4">
                      {[
                        { label: "Não", value: false },
                        { label: "Sim", value: true },
                      ].map((option) => (
                        <Button
                          key={option.label}
                          type="button"
                          variant={field.value === option.value ? "default" : "outline"}
                          onClick={() => field.onChange(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h3 className="font-medium mb-4">Endereço</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Lembre-se, este endereço será utilizado em todas as suas inscrições.
                </p>
                
                <p className="text-sm font-medium mb-2">Você mora no Brasil? *</p>
                <div className="flex gap-4 mb-4">
                  <Button type="button" variant="default">Sim</Button>
                  <Button type="button" variant="outline">Não</Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP (Código de Endereçamento Postal) *</FormLabel>
                        <FormControl>
                          <Input placeholder="72300-641" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço *</FormLabel>
                        <FormControl>
                          <Input placeholder="Q 302 Cj 8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Distrito Federal">Distrito Federal</SelectItem>
                            <SelectItem value="São Paulo">São Paulo</SelectItem>
                            <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                            {/* Add all Brazilian states */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input placeholder="Brasília" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil do LinkedIn</FormLabel>
                    <p className="text-sm text-muted-foreground mb-2">
                      Link (URL) do seu perfil (opcional)
                    </p>
                    <FormControl>
                      <Input placeholder="www.linkedin.com/in/anderson-ssouza-alves" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="button" className="w-full">
                Salvar e continuar
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Diversity */}
          <AccordionItem value="diversity">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Diversidade</span>
                {form.watch("diversityConsent") && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
                <p className="text-sm">
                  O preenchimento desta seção é opcional. As informações serão usadas em todos os processos que utilizam a solução de Diversidade. 
                  Nenhum dado será utilizado como critério de eliminação.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado de origem:</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Distrito Federal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Distrito Federal">Distrito Federal</SelectItem>
                          {/* Add all states */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="originCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade de origem:</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Brasília" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Brasília">Brasília</SelectItem>
                          {/* Add cities */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pronoun"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual o pronome adequado para você:</FormLabel>
                      <div className="space-y-2">
                        {["Ela / Dele", "Ele / Dele", "Prefiro não responder"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={option}
                              checked={field.value === option}
                              onChange={() => field.onChange(option)}
                              className="w-4 h-4"
                            />
                            <label htmlFor={option} className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genderIdentity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual sua identidade de gênero:</FormLabel>
                      <div className="space-y-2">
                        {["Cisgênero", "Transgênero", "Prefiro não responder"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={option}
                              checked={field.value === option}
                              onChange={() => field.onChange(option)}
                              className="w-4 h-4"
                            />
                            <label htmlFor={option} className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sexualOrientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual sua orientação sexual:</FormLabel>
                      <div className="space-y-2">
                        {["Assexual", "Bissexual", "Heterossexual", "Homossexual", "Pansexual", "Prefiro não responder"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={option}
                              checked={field.value === option}
                              onChange={() => field.onChange(option)}
                              className="w-4 h-4"
                            />
                            <label htmlFor={option} className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="race"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual sua cor ou raça:</FormLabel>
                      <div className="space-y-2">
                        {["Amarela", "Branca", "Indígena", "Parda", "Preta", "Prefiro não responder"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={option}
                              checked={field.value === option}
                              onChange={() => field.onChange(option)}
                              className="w-4 h-4"
                            />
                            <label htmlFor={option} className="text-sm">{option}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="diversityConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Eu concordo em compartilhar esses dados com as empresas para que possam ser realizadas ações voltadas à promoção de diversidade
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Acesse o <a href="#" className="text-primary underline">Aviso de Privacidade da Gupy</a>.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="button" className="w-full">
                Salvar
              </Button>
            </AccordionContent>
          </AccordionItem>

          {/* Skills */}
          <AccordionItem value="skills">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-2">
                <span>Habilidades</span>
                {(form.watch("skills") || []).length > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Você pode informar até 30 habilidades que possui. (As habilidades envolvem desde conhecimentos técnicos até o modo como você se relaciona com as pessoas). 
                  Para mais informações, acesse a nossa <a href="#" className="text-primary underline">Central de ajuda</a>.
                </p>

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Escreva e selecione uma habilidade"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill}>
                    Adicionar
                  </Button>
                </div>

                <p className="text-sm font-medium mb-2">
                  {(form.watch("skills") || []).length} de 30 habilidades
                </p>

                <div className="flex flex-wrap gap-2">
                  {(form.watch("skills") || []).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  ⚠️ Não se esqueça de clicar no botão "Salvar" após realizar as alterações
                </p>
              </div>

              <Button type="button" className="w-full">
                Salvar
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={updateMutation.isPending} size="lg">
            {updateMutation.isPending ? "Salvando..." : "Salvar todas as alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
